import fs from 'node:fs';
import {webcrypto} from 'node:crypto';
import {seal} from '../../js/native-sign-in-crypto.js';
if (!globalThis.crypto) globalThis.crypto=webcrypto;
const path=process.argv[2],fixture=JSON.parse(fs.readFileSync(path,'utf8'));
const encrypted=await seal('test.jwt.signature',fixture.publicKey,fixture.state);
fixture.callback='com.kharrison.lastdragonrider://signin#'+new URLSearchParams({state:fixture.state,...encrypted});
fs.writeFileSync(path,JSON.stringify(fixture));
