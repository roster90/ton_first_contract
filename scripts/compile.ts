import * as fs from 'fs';
import process from 'process';
import { Cell } from 'ton-core';
import { compileFunc } from '@ton-community/func-js'

async function compileScript() {
    console.log('Compiling contract...');
    
    const compileResult = await compileFunc({
        targets: ['./contracts/main.fc'],
        sources: (x) => fs.readFileSync(x).toString('utf-8'),
    })


    // console.log(compileResult);
    if (compileResult.status == 'error') {
        console.log('Error compiling contract!');
        process.exit(1);
    }
    const hexArtifact = `build/main.compiled.json`

    fs.writeFileSync(hexArtifact, JSON.stringify({
        hex: Cell.fromBoc(Buffer.from(compileResult.codeBoc, 'base64'))[0].toBoc().toString('hex')
    }));
    console.log('Contract compiled successfully!');

}

compileScript();