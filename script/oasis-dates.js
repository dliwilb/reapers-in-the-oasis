// oasis-dates.js - shake it!

let isWalletConnected = false;
let isNetworkConnected = false;

// onConnect();


async function getCurrentPrice() {
	const provider = new ethers.providers.Web3Provider(window.ethereum);
    const marketContractAddress = '0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7';   // Oasis New
    
    const marketContract = new ethers.Contract(marketContractAddress, NftExV2Abi, provider);
    
    let nftPrice = await marketContract.getCurrentPrice('0x110936f6f0f3a0b8cff3e3f97cc08244e9a61f3d0147c1de0f1af625afa0faec');

    document.getElementById('price-of-reaper').innerHTML = nftPrice;

}


async function shakeIt() {
	// const provider = new ethers.providers.Web3Provider(window.ethereum);
    const provider = new ethers.providers.JsonRpcProvider('https://smartbch.greyh.at');

    const blockNum = await provider.getBlockNumber();   
    const queryPeriodHour = document.getElementById('query-period-hours').value;
    const queryPeriodBlock = queryPeriodHour * 60 * 60 / 5;
    const fromBlock = blockNum - queryPeriodBlock;
    const toBlock = blockNum;
    // console.log(blockNum);

    const marketContractAddress = '0x3b968177551a2aD9fc3eA06F2F41d88b22a081F7';   // Oasis New
    const marketContract = new ethers.Contract(marketContractAddress, NftExV2Abi, provider);

    const nftContractAddress = '0x48973dbAC0d46B939CD12A7250eFBA965e8a8cf2';  // Reapers

    const eventFilter = marketContract.filters.MakeOrder(nftContractAddress);
    const events = await marketContract.queryFilter(eventFilter, fromBlock, toBlock);
    // console.log(events);

    // const nOfEvents = events.length;

    document.getElementById('list-of-reapers').innerHTML = `<p>[MakeOrder events from block ${fromBlock} to block ${toBlock}]</p><br>`;
    for (let i = 0; i < events.length; i++) {
        const orderHash = events[i].args[2];
        const tokenId = events[i].args[1];
        const seller = events[i].args[3];
        
        const nftPrice = await marketContract.getCurrentPrice(orderHash);
        const nftPriceBCH = nftPrice / 1e18;
        const orderInfo = await marketContract.orderInfo(orderHash);
        // console.log(orderInfo);
        const auctionType = ['Fixed Price', 'Dutch Auction', 'English Auction'];

        const nftContract = new ethers.Contract(nftContractAddress, ERC721Abi, provider);

        const nftURI = await nftContract.tokenURI(tokenId);
        const nftJSON = await fetchJSON(nftURI);

        // document.getElementById('price-of-reaper').innerHTML = nftPrice;

        document.getElementById('list-of-reapers').innerHTML = 
            document.getElementById('list-of-reapers').innerHTML + 
            '<p>Token ID: ' + tokenId + '<br> Seller: ' + seller + '<br> Order Hash: ' + orderHash + '<br>' +
            `<img src="${nftJSON.image}" width=300 height=300><br> Current Price: ` + 
            nftPriceBCH + ` BCH @ ${auctionType[orderInfo[0]]} | sold? ${orderInfo[10]} | cancelled? ${orderInfo[11]} | ` + 
            `<a href="https://oasis.cash/token/${nftContractAddress}/${tokenId}" target="_blank">check it out on OASIS&thinsp;<img src="icons8-external-link-16_goldish.png"></a> | <a href="${nftURI}" target="_blank">check attributes&thinsp;<img src="icons8-external-link-16_goldish.png"></a></p><br>`;
            // '<p>' + tokenId + '<br>' + seller + '<br>' + orderHash + '<br>' + nftPriceBCH + 
            // ` BCH ${auctionType[orderInfo[0]]} Sold? ${orderInfo[10]} Cancelled? ${orderInfo[11]}<br>` + 
            // nftURI + '<br>' + `<img src="${nftJSON.image}" width=300 height=300>` + '</p>';
            // `<p>Token ID: ${tokenId}<br> Seller: ${seller}<br> orderHash: ${orderHash}<br>`;
    }

    // const eventObj = JSON.parse(events);
    console.log(events.length);
}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}
