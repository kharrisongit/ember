/* Render the same Canvas animation used by the browser preview.
   Requires @napi-rs/canvas; output frames are temporary encoder inputs. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {createCanvas,loadImage}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES
  ? path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas') : '@napi-rs/canvas');
const root=path.resolve(new URL('..',import.meta.url).pathname);
const output=process.argv[2];if(!output)throw Error('Provide an output directory for PNG frames.');
fs.mkdirSync(output,{recursive:true});
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'js/crafting-hearth-motion.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'js/crafting-potion-preview.js'),'utf8'),context);
const [hearth,spoon,flameCurl,flameFork,smoke,ingredients]=await Promise.all([
  ...['hearth-clean','spoon','flame-curl','flame-fork','smoke'].map(file=>loadImage(path.join(root,'assets/crafting/animations/potion-v3',file+'.webp'))),
  loadImage(path.join(root,'assets/crafting/ingredients.webp'))
]);
const renderer=context.PotionMotionPreview.make({hearth,spoon,flameCurl,flameFork,smoke,ingredients,createCanvas});
const scene=createCanvas(768,768),frame=createCanvas(192,192),g=frame.getContext('2d');
for(let i=0;i<260;i++){
  renderer.draw(scene,i/50);
  g.fillStyle='#ead9b7';g.fillRect(0,0,192,192);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(scene,0,0,192,192);
  fs.writeFileSync(path.join(output,String(i).padStart(3,'0')+'.png'),frame.toBuffer('image/png'));
}
console.log('Rendered 260 frames at 50 fps: 4.5 seconds of crafting and a 0.7-second finish hold.');
