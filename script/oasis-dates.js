// oasis-dates.js - shake it!

let isWalletConnected = false;
let isNetworkConnected = false;

// onConnect();

async function shakeIt() {
	const provider = new ethers.providers.Web3Provider(window.ethereum);

    const blockNum = await provider.getBlockNumber();   
    const queryPeriodHour = 24;
    const queryPeriodBlock = queryPeriodHour * 60 * 60 / 5;
    const fromBlock = blockNum - queryPeriodBlock;
    const toBlock = blockNum;
    // console.log(blockNum);

    let nftaddress = '0x48973dbAC0d46B939CD12A7250eFBA965e8a8cf2';  // Reapers
    const contractAddress = '0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7';   // Oasis New
    
    const contract = new ethers.Contract(contractAddress, NftExV2Abi, provider);
    let eventFilter = contract.filters.MakeOrder(nftaddress);
    let events = await contract.queryFilter(eventFilter, fromBlock, toBlock);
    console.log(events);
}