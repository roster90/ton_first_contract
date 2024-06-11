import { hex } from '../build/main.compiled.json';
import { Address, Cell, contractAddress, toNano } from 'ton-core';
import {getHttpV4Endpoint} from '@orbs-network/ton-access'
import {TonClient4} from 'ton';
import qs from "qs";
import qrcode from "qrcode-terminal";

async function onchainTestScript() {
    const codeCell = Cell.fromBoc(Buffer.from(hex, "hex"))[0];
    const dataCell = new Cell();
 
    const address = contractAddress(0, {
        code: codeCell,
        data: dataCell,
    });
 
    console.log(address.toString());
    const endpoint = await getHttpV4Endpoint({
        network: "testnet",
    });
    const client4 = new TonClient4({endpoint});
    const latestBlock = await client4.getLastBlock();
    let status = await client4.getAccount(latestBlock.last.seqno, address);
    
    if(status.account.state.type !=="active"){
        console.log("Contract is not active");
        return;
    }

    //send Ton by qr code
    let link =`https://test.tonhub.com/transfer/` + address.toString({testOnly: true,}) + "?" +
    qs.stringify({
      text: "simple test contract",
      amount: toNano("0.1").toString(10)    
    });

    qrcode.generate(link, { small: true }, (code) => {console.log(code);});


    //check call func smart  contract

    let recent_sender_archive : Address

    setInterval(async () => {
        const latestBlock = await client4.getLastBlock();
        const { exitCode, result } = await client4.runMethod(
            latestBlock.last.seqno,
            address,
            "get_the_latest_sender"
        );
        
        if(exitCode !== 0){
            console.log("Error calling contract");
            return;
        }
        if(result[0].type !== "slice"){
            console.log("Unknown type");
            return
        }
        let most_recent_sender = result[0].cell.beginParse();   
        console.log("Most recent sender: ", most_recent_sender.loadAddress());
        
        
        // if(most_recent_sender && most_recent_sender.toString() !== recent_sender_archive.toString()){
        //     console.log("New sender: ", most_recent_sender.toString());
        //     recent_sender_archive = most_recent_sender;
        // }
        // if ( most_recent_sender &&  most_recent_sender.toString() !== recent_sender_archive?.toString()) {
        //     console.log(
        //         "New recent sender found: " +
        //         most_recent_sender.toString({ testOnly: true })
        //     );
        //     recent_sender_archive = most_recent_sender;
        //   }
        
    }, 2000)
    
};


onchainTestScript();