//Cluster

//Library Imports
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const Web3 = require('web3');

//Declarations
const { TOKEN, SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;
const app = express();
app.use(bodyParser.json());

//File Imports
const sendResponse = require('./utils/sendResponse');
const { getNFTData } = require('./utils/getNFTData');

//Web3 declarations
const address = '0x84135ef38E33f5cc9c61fCb5469F173BB1261C5F'.toLowerCase();
const abi = [
    {
        inputs: [
            { internalType: 'string', name: 'name', type: 'string' },
            { internalType: 'string', name: 'symbol', type: 'string' },
            { internalType: 'string', name: 'baseTokenURI', type: 'string' },
        ],
        stateMutability: 'nonpayable',
        type: 'constructor',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'approved',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Approval',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'owner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'operator',
                type: 'address',
            },
            {
                indexed: false,
                internalType: 'bool',
                name: 'approved',
                type: 'bool',
            },
        ],
        name: 'ApprovalForAll',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'previousOwner',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'newOwner',
                type: 'address',
            },
        ],
        name: 'OwnershipTransferred',
        type: 'event',
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: 'address',
                name: 'from',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'address',
                name: 'to',
                type: 'address',
            },
            {
                indexed: true,
                internalType: 'uint256',
                name: 'tokenId',
                type: 'uint256',
            },
        ],
        name: 'Transfer',
        type: 'event',
    },
    {
        inputs: [],
        name: 'DexRouter',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'FeeReceiver',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'RewardToken',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'approve',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'baseExtension',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'claimRewards',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'claimRewardsTokens',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'cost',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'getApproved',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'getReflectionBalance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
        name: 'getReflectionBalances',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
        name: 'getTokenIds',
        outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'address', name: 'operator', type: 'address' },
        ],
        name: 'isApprovedForAll',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'lastDividendAt',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'lastSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maxMintAmount',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'maxSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_mintAmount', type: 'uint256' },
        ],
        name: 'mint',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'mintReward',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'minters',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'name',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'owner',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
        name: 'ownerOf',
        outputs: [{ internalType: 'address', name: '', type: 'address' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'bool', name: '_state', type: 'bool' }],
        name: 'pause',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'paused',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_winner', type: 'address' },
            { internalType: 'uint256', name: '_amount', type: 'uint256' },
        ],
        name: 'randomGiveaway',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'reflectToOwners',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'reflectionBalance',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        name: 'remainingIds',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'renounceOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [],
        name: 'router',
        outputs: [
            {
                internalType: 'contract IUniswapV2Router02',
                name: '',
                type: 'address',
            },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
            { internalType: 'bytes', name: '_data', type: 'bytes' },
        ],
        name: 'safeTransferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'operator', type: 'address' },
            { internalType: 'bool', name: 'approved', type: 'bool' },
        ],
        name: 'setApprovalForAll',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'string',
                name: '_newBaseExtension',
                type: 'string',
            },
        ],
        name: 'setBaseExtension',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'string', name: 'baseURI', type: 'string' }],
        name: 'setBaseURI',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'uint256', name: '_newCost', type: 'uint256' },
        ],
        name: 'setCost',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: '_newDexRouter', type: 'address' },
        ],
        name: 'setDexRouter',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_newFeeReceiver',
                type: 'address',
            },
        ],
        name: 'setFeeReceiver',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'address',
                name: '_newRewardToken',
                type: 'address',
            },
        ],
        name: 'setRewardToken',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            {
                internalType: 'uint256',
                name: '_newmaxMintAmount',
                type: 'uint256',
            },
        ],
        name: 'setmaxMintAmount',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' },
        ],
        name: 'supportsInterface',
        outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'symbol',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'token',
        outputs: [
            { internalType: 'contract IERC20', name: '', type: 'address' },
        ],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: 'index', type: 'uint256' }],
        name: 'tokenByIndex',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'uint256', name: 'index', type: 'uint256' },
        ],
        name: 'tokenOfOwnerByIndex',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
        name: 'tokenURI',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalDividend',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [],
        name: 'totalSupply',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'from', type: 'address' },
            { internalType: 'address', name: 'to', type: 'address' },
            { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
        ],
        name: 'transferFrom',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
    {
        inputs: [
            { internalType: 'address', name: 'newOwner', type: 'address' },
        ],
        name: 'transferOwnership',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function',
    },
];
const web3 = new Web3(
    'wss://purple-few-moon.bsc.discover.quiknode.pro/c746d488a6cc9cb25b021f185978eac0426f5ad1/'
);
const contract = new web3.eth.Contract(abi, address);
const groups = [];
let chatId;

const init = async () => {
    try {
        axios
            .get(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`)
            .then((res) => {
                console.log(res.data);
                axios
                    .get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
                    .then((res) => console.log(res.data));
            });

        //Event options
        let options = {
            filter: {
                value: [],
            },
        };

        //Listen for contract events
        contract.events
            .Transfer(options)
            .on('data', (event) => {
                if (
                    event.returnValues['0'] ===
                    '0x0000000000000000000000000000000000000000'
                ) {
                    (async () => {
                        const remaining = await contract.methods
                            .lastSupply()
                            .call();
                        const totalSupply = await contract.methods
                            .totalSupply()
                            .call();
                        getNFTData(contract, event.returnValues.tokenId).then(
                            ({ imageURI, owner, traitValue }) => {
                                if (groups.length > 0) {
                                    for (let group in groups) {
                                        sendResponse.sendPhoto(
                                            TELEGRAM_API,
                                            group,
                                            imageURI,
                                            `🧀*RatBot NFT Minted🧀*\n\n*${remaining}/${totalSupply} Minted*\n\n*Owner:* https://bscscan.com/address/${owner}\n\n*ID:*${event.returnValues.tokenId}\n${traitValue}`,
                                            messageId
                                        );
                                    }
                                }
                            }
                        );
                    })();
                }
            })
            .on('error', (err) => {
                console.log(err);
            })
            .on('connected', (str) => console.log(str, 'connected'));
    } catch (err) {}
};

app.post(URI, (req, res) => {
    let text;
    let newGroup = true;
    try {
        chatId = req.body.message.chat.id;
        text = req.body.message.text;
        messageId = req.body.message.message_id;

        //Check if message was sent
        if (text) {
            if (text == '/ratboynft') {
                if (groups.length <= 5) {
                    console.log(chatId);
                    for (let group of groups) {
                        if (group === chatId) {
                            console.log('Already activated');
                            console.log(groups);
                            newGroup = false;
                        }
                    }
                    if (newGroup) {
                        groups[groups.length] = chatId;
                        console.log(groups);
                        try {
                            sendResponse.sendMessage(
                                TELEGRAM_API,
                                chatId,
                                `*RatBoy NFT Bot Acvivated with chat id:* ${chatId}`,
                                messageId
                            );
                        } catch (err) {
                            console.log(err);
                        }
                    }
                } else {
                    console.log('Too many groups');
                }
            } else if (text.split(' ')[0] == '/nftlookup') {
                const find = groups.find((e) => (e = chatId));
                if (find) {
                    let nftID = parseInt(text.split(' ')[1]);
                    console.log(typeof nftID, nftID);
                    if (nftID) {
                        try {
                            sendResponse.sendMessage(
                                TELEGRAM_API,
                                chatId,
                                '*Fetching data, please be patient!*',
                                messageId
                            );
                            getNFTData(contract, nftID).then(
                                ({ imageURI, owner, traitValue }) => {
                                    console.log(imageURI);
                                    sendResponse.sendPhoto(
                                        TELEGRAM_API,
                                        chatId,
                                        imageURI,
                                        `*Owner:* https://bscscan.com/address/${owner}\n\n${traitValue}`,
                                        [
                                            'View On TofuNFt',
                                            `https://tofunft.com/nft/bsc/${address}/${nftID}`,
                                        ],
                                        messageId
                                    );
                                }
                            );
                        } catch (err) {
                            console.log(err);
                            sendResponse.sendMessage(
                                TELEGRAM_API,
                                chatId,
                                'Please try again later',
                                messageId
                            );
                        }
                    } else {
                        sendResponse.sendMessage(
                            TELEGRAM_API,
                            chatId,
                            `*This command looks up the image of a given RatBoy NFT. Please include the id of the nft following the command.* \nExample: /nftlookup 420`,
                            messageId
                        );
                    }
                } else {
                    console.log('Group not added');
                }
            }
        } else {
            console.log('Other than text');
        }
    } catch (err) {
        console.log(req.body.message);
        console.log(err);
    }
    return res.send();
});

app.listen(process.env.PORT || 5000, () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
    init();
});
