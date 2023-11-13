// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function mint(address to, uint256 amount) external;
}

contract GreenReward {
    address public Owner;
    uint256 public productsID = 1;
    uint256 sellerID = 1;
    uint256 public platformFeePercentage = 1; // 1% platform fee
    address public platformFeeRecipient;

    address greenRewardToken;

    event ProfileCreated(address indexed creator, string indexed name, uint256 indexed sellerId);
    event ProductListed(address indexed lister, string indexed productName, uint256 indBought);
    event ProductBought(address indexed buyer, uint256 indexed productID, uint256 indexed amount);
    event PaymentApproved(address indexed buyer, uint256 indexed productID, uint256 indexed amount);
    event ProfileUpdated(address indexed creator, string indexed location, string indexed mail);
    event ProductUpdated(address indexed creator, string indexed name, uint256 indexed weight);

    modifier onlyOwner(){
        require(msg.sender == Owner, "Not Owner");
        _;
    }

    modifier validString(string memory _string){
        bytes memory tempEmptyStringTest = bytes(_string);
        require(tempEmptyStringTest.length > 0, "Empty String");
        _;
    }

    struct sellerDetail{
        address sellerAddress;
        uint256 sellerId;
        string name;
        string location;
        string mail;
        uint256 recycled;
        uint256 recycledWeight;
        uint256 totalPayout;
    }

    struct Product {
        address owner;
        string name;
        string image;
        string location;
        string description;
        uint price; //price per kg
        uint256 totalWeight; //weight in kg
        uint sold; 
        uint256 inProgress;
    }


    mapping(uint256 => sellerDetail) seller;
    mapping(address => bool) registered;
    mapping(uint256 => Product) products;
    mapping(address => uint256[]) sellersProductId;
    mapping(uint256 => mapping(address => uint256)) amountBought;
    mapping(address => uint256) sellersProfileId;
    mapping(string => uint256[]) productsINLocation; //store products in a location
    mapping(string => bool) locationCheck; //check if location already exist



    constructor(address _GreenRewardToken, address _platformFeeRecipient){
        Owner = msg.sender;
        greenRewardToken = _GreenRewardToken;
        platformFeeRecipient = _platformFeeRecipient;
    }


    function createProfile(string memory _name, string memory _location, string memory _mail) external validString(_name) validString(_location) validString(_mail) {
        require(registered[msg.sender] == false, "Registered Already");
        
        uint256 _sellerID = sellerID;

        seller[_sellerID].sellerAddress = msg.sender;
        seller[_sellerID].name = _name;
        seller[_sellerID].sellerId = _sellerID;
        seller[_sellerID].location = _location;
        seller[_sellerID].mail = _mail;

        registered[msg.sender] = true;

        sellersProfileId[msg.sender] = _sellerID;
        sellerID++;

        emit ProfileCreated(msg.sender, _name, _sellerID);
    }

    function listProduct(
        string memory _name, 
        string memory _image, 
        string memory _description, 
        uint256 _price, 
        uint256 _weight) external validString(_name) validString(_image) validString(_description){
            require(_price > 0 && _weight > 0, "Price/Weight Cannot Be Zero");
            require(registered[msg.sender] == true, "Kindly Register");
            uint256 _sold = 0;
            uint256 _inProgress;
            products[productsID] = Product(
                msg.sender,
                _name,
                _image,
                seller[sellersProfileId[msg.sender]].location,
                _description,
                _price,
                _weight,
                _sold,
                _inProgress
            );

            locationCheck[ seller[sellersProfileId[msg.sender]].location] = true;
            productsINLocation[ seller[sellersProfileId[msg.sender]].location].push(productsID);


            sellersProductId[msg.sender].push(productsID);
            IERC20(greenRewardToken).mint(msg.sender, 10 ether);
            productsID++;

        emit ProductListed(msg.sender, _name, _weight);
    }

    function buyProduct(uint256 _productID, uint256 _amount) public payable {
        require(products[_productID].owner != address(0), "INVALID ID");
        require(_amount > 0, "Invalid Amount");
        require(products[_productID].totalWeight >= _amount, "Not Enough Product");

        uint256 totalAmount = products[_productID].price * _amount;
        require(msg.value >= totalAmount, "Insufficient Amount");
        products[_productID].sold += _amount;
        products[_productID].inProgress += 1;
        products[_productID].totalWeight -= _amount;
        amountBought[_productID][msg.sender] += totalAmount;

        emit ProductBought(msg.sender, _productID, _amount);
    }

    function approvePayment(uint256 _productID) external {
        require(products[_productID].owner != address(0), "INVALID ID");
        uint256 totalAmount = amountBought[_productID][msg.sender];
        require(totalAmount != 0, "Not Bought");

        // Calculate the platform fee
        uint256 platformFee = (totalAmount * platformFeePercentage) / 100;
        uint256 amountToTransfer = totalAmount - platformFee;
        amountBought[_productID][msg.sender] = 0;

        // Transfer the payment amount minus the platform fee to the product owner
        (bool sent, ) =  payable(products[_productID].owner).call{value: amountToTransfer}("");
        require(sent, "Failed to send amount");

        // Transfer the platform fee to the platform fee recipient
        (bool success, ) = payable(platformFeeRecipient).call{value: platformFee}("");
        require(success, "Failed to send platform fee");
        products[_productID].inProgress -= 1;
        IERC20(greenRewardToken).mint(msg.sender, 10 ether);
        
        emit PaymentApproved(msg.sender, _productID, totalAmount);
    }


    function updateProfile(string memory _location, string memory _mail) external validString(_location) validString(_mail) {
        require(registered[msg.sender] == true, "Not Registered");
        uint256 _sellerID = sellersProfileId[msg.sender];
        seller[_sellerID].location = _location;
        seller[_sellerID].mail = _mail;

        emit ProfileUpdated(msg.sender, _location, _mail);
    }

    function updateProduct(uint256 _productID, string memory _name, string memory _image, string memory _description, uint256 _price, uint256 _weight) external validString(_name) validString(_image) validString(_description) {
        require(products[_productID].owner == msg.sender, "Not Owner");
        require(_price > 0 && _weight > 0, "Price/Weight Cannot Be Zero");
        require(products[_productID].inProgress == 0, "Purchase in progress");

        products[_productID].name = _name;
        products[_productID].image = _image;
        products[_productID].description = _description;
        products[_productID].price = _price;
        products[_productID].totalWeight = _weight;

        emit ProductUpdated(msg.sender, _name, _weight);
    }


    function findLocation(string memory _location) external view returns(uint256[] memory){
        require(locationCheck[_location] == true, "Not Available");
        return productsINLocation[_location];
    
    }


    function locationDetails(string memory _location) external view returns (sellerDetail[] memory) {
        uint256[] memory allLocation = productsINLocation[_location];
        uint256 lengthOfLocation = allLocation.length;

        sellerDetail[] memory allSeller = new sellerDetail[](lengthOfLocation);

        for (uint256 i = 0; i < lengthOfLocation; i++) {
            uint256 sellerid = allLocation[i];
            allSeller[i] = seller[sellerid];
        }

        return allSeller;
    }

    function findId(address _owner) public view returns(uint256){
        require(registered[_owner] == true, "Not Available");
        return sellersProfileId[_owner];
    }

    function getSeller(address _owner) external view returns(sellerDetail memory){
        uint256 sellerid = findId(_owner);
        return seller[sellerid];
    }

    function getProductDetails(uint256 _productID) external view returns(Product memory){
        require(products[_productID].owner != address(0), "INVALID ID");
        return products[_productID];
    }

    function getAllproduct() external view returns(Product[] memory){
        Product[] memory allProduct = new Product[](productsID - 1);
        for(uint256 i = 1; i < productsID; i++){
            allProduct[i - 1] = products[i];
        }
        return allProduct;
    }

    function getallSeller() external view returns(sellerDetail[] memory){
        sellerDetail[] memory allSeller = new sellerDetail[](sellerID - 1);
        for(uint256 i = 1; i < sellerID; i++){
            allSeller[i - 1] = seller[i];
        }
        return allSeller;
    }


}