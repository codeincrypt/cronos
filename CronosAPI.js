const express = require("express");
const Web3 = require("web3");

const nodeURL = "https://evm-t3.cronos.org";
const web3 = new Web3(nodeURL);

const app = express();
const PORT = process.env.PORT || 10094;
app.use(express.json());

app.listen(PORT, () => {
    console.log("CRO - App now running on port", PORT);
});

app.get("/address", async (req, res) => {
    try {
        const response = await web3.eth.accounts.create();
        var pubkey = response.address
		var privkey = response.privateKey

    	var output = {
			pubkey      : pubkey,
			privkey     : privkey,
		};
		console.log(output);
		res.json(output);
	} catch (error) {
		console.log("Error ", error);
		res.json({ message: error.message });
	}
})


app.post("/balance", async (req, res) => {
	var { publickey } = req.body;
	try {
		const node_bal = await web3.eth.getBalance(publickey)
        var balance  = web3.utils.fromWei(node_bal, "ether");

		var output = {
			balance		: balance,
		};
		console.log(output);
		res.json(output);
	} catch (err) {
		console.log("Error", err);
		res.json({ message: err.message });
	}
});


app.post("/transfer", async (req, res) => {
	var { senderprivkey, receiverpubkey, amount } = req.body;
    try {
        var amounttoWei = web3.utils.toWei(amount, "ether");
		var privateKey = senderprivkey

        var sender = web3.eth.accounts.privateKeyToAccount(privateKey)
        var senderpubkey = sender.address
		const txCount = await web3.eth.getTransactionCount(senderpubkey)

		const transaction = {
			nonce   : web3.utils.toHex(txCount),
			to      : receiverpubkey,
			value   : amounttoWei,
			gas     : 300000,
		};

		const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
		const response = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

        var txnid = response.transactionHash
		console.log("txnid : ", txnid);
		var txn_output = {
			txnhash     : txnid,
		};
		res.json(txn_output); 
    } catch (err) {
        console.log("error", err);
        res.json({ message: err.message });
    }
})
