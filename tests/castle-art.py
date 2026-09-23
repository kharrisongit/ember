from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[1]
im=Image.open(root/'assets/interiors/royal-cellar.png').convert('RGBA')
assert im.size==(320,288)
# Three complete internal columns have identical pixels and regular spacing.
columns=[im.crop((x-16,0,x+16,64)).tobytes() for x in (88,160,232)]
assert columns[0]==columns[1]==columns[2]
bg=(43,37,40,255)
for x in list(range(8))+list(range(312,320)):
 for y in range(272,288):assert im.getpixel((x,y))==bg, 'Bottom trim protrudes beyond the side wall'
wall=Image.open(root/'assets/interiors/throne-door-wall.png')
doors=Image.open(root/'assets/interiors/throne-door-frames.png')
assert wall.size==(64,51) and doors.size==(192,51)
assert all(doors.crop((f*32,0,(f+1)*32,51)).getbbox() for f in range(6))
print('PASS: complete evenly spaced pillars, bounded bottom corners, aligned wall and all six door frames.')
