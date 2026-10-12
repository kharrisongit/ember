#!/usr/bin/env python3
"""Copy only the public game into the app; build products, server secrets and tooling stay out."""
import json, pathlib, plistlib, shutil, sys
root=pathlib.Path(__file__).resolve().parents[1]
app=pathlib.Path(sys.argv[1]); version=sys.argv[2]; build=sys.argv[3]; simulator=len(sys.argv)>4
app.mkdir(parents=True,exist_ok=True)
game=app/'Game';game.mkdir(exist_ok=True)
for name in ['assets','css','js']:
    shutil.copytree(root/name,game/name,dirs_exist_ok=True)
for name in ['index.html','manifest.webmanifest']:
    shutil.copy2(root/name,game/name)
shutil.copy2(root/'native/Resources/native-bridge.js',app/'native-bridge.js')
info={
    'CFBundleDevelopmentRegion':'en','CFBundleDisplayName':'The Last Dragonrider',
    'CFBundleName':'Dragonrider','CFBundleExecutable':'Dragonrider','CFBundleIdentifier':'com.kharrison.lastdragonrider',
    'CFBundlePackageType':'APPL','CFBundleInfoDictionaryVersion':'6.0','CFBundleShortVersionString':version,
    'CFBundleVersion':build,'MinimumOSVersion':'15.0','LSRequiresIPhoneOS':True,'UIDeviceFamily':[1,2],
    'CFBundleSupportedPlatforms':['iPhoneSimulator' if simulator else 'iPhoneOS'],
    'UILaunchStoryboardName':'LaunchScreen','UIRequiresFullScreen':True,
    'UIViewControllerBasedStatusBarAppearance':True,'UIStatusBarHidden':True,
    'UISupportedInterfaceOrientations':['UIInterfaceOrientationPortrait'],
    'UISupportedInterfaceOrientations~ipad':['UIInterfaceOrientationPortrait','UIInterfaceOrientationPortraitUpsideDown','UIInterfaceOrientationLandscapeLeft','UIInterfaceOrientationLandscapeRight'],
    'CFBundleURLTypes':[{'CFBundleURLName':'Google sign-in return','CFBundleURLSchemes':['com.kharrison.lastdragonrider']}],
    'NSAppTransportSecurity':{'NSAllowsLocalNetworking':True,'NSExceptionDomains':{'127.0.0.1':{'NSExceptionAllowsInsecureHTTPLoads':True}}},
    'ITSAppUsesNonExemptEncryption':False
}
(app/'Info.plist').write_bytes(plistlib.dumps(info))
(app/'PkgInfo').write_bytes(b'APPL????')
# Required AppIcon entries, all derived from the game's existing favicon.
icons=[]
for idiom,points,scales in [('iphone',[20,29,40,60],[2,3]),('ipad',[20,29,40,76],[1,2]),('ipad',[83.5],[2]),('ios-marketing',[1024],[1])]:
    for size in points:
        for scale in scales:
            icons.append({'idiom':idiom,'size':f'{size}x{size}','scale':f'{scale}x','filename':f'icon-{int(size*scale)}.png'})
catalog=app.parent/'Assets.xcassets'/'AppIcon.appiconset';catalog.mkdir(parents=True,exist_ok=True)
(catalog/'Contents.json').write_text(json.dumps({'images':icons,'info':{'version':1,'author':'xcode'}}))
print(f'Packaged {sum(1 for p in game.rglob("*") if p.is_file())} game files')
