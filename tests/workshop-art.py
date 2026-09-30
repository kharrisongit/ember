from pathlib import Path
import runpy
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
art = root / 'assets/sprites/workshops'
helpers = runpy.run_path(str(root/'tools/pack-workshop-craftsmen.py'))
native, bench = helpers['original_station']()
for action, count in [('work', 42), ('idle', 4)]:
    image = Image.open(art/f'dunstan-{action}.png').convert('RGBA')
    assert image.size == (96*count, 140), 'Complete 68px assembly plus bottom padding'
    data = np.array(image)
    assert set(np.unique(data[:, :, 3])) == {0, 255}, 'Hard alpha only'
    upper = np.array(Image.open(art/f'source/dunstan-upper-{action}.png'))
    frames = [data[:, i*96:(i+1)*96] for i in range(count)]
    for i, frame in enumerate(frames):
        assert np.array_equal(frame[:64, :, 3], upper[:, i*96:(i+1)*96, 3]), 'Do not crop or reshape Dunstan or his hammer'
        assert not any(np.any(edge) for edge in [frame[0, :, 3], frame[-1, :, 3], frame[:, 0, 3], frame[:, -1, 3]]), (action, i, 'clipped silhouette')
        # Compare every anvil/contact/join pixel to the original authoring anchors.
        source_index = i if action == 'work' else 0
        expected = Image.new('RGBA', (48, 70))
        expected.alpha_composite(bench, (182-176, 185-144))
        expected.alpha_composite(native.crop((source_index*48, 0, (source_index+1)*48, 48)))
        expected = np.array(expected.resize((96, 140), Image.Resampling.NEAREST))
        assert np.array_equal(frame[64:], expected[64:]), (action, i, 'native station/tool pixels changed')
        assert np.any(frame[94:100, :, 3], axis=1).all(), (action, i, 'gap at the old split')
        assert np.array_equal(frame[96:], frames[0][96:]), 'Bench front must never wobble'
    if action == 'idle':
        assert len({frame.tobytes() for frame in frames}) == 4, 'Four distinct conversation poses'
        for frame in frames[1:]:
            assert np.array_equal(frame[64:], frames[0][64:]), 'Idle station remains fixed'
            assert np.array_equal(frame[:38], frames[0][:38]), 'No idle head/hair bob'
    else:
        for i in (5, 11, 17, 23):
            head = frames[i][0:24, 62:86]
            visible = head[:, :, 3] > 0
            rgb = head[:, :, :3].astype(int)
            metal = visible & (rgb[:, :, 2] > rgb[:, :, 0]) & (rgb.mean(axis=2) > 90)
            assert metal.sum() > 20, 'Raised steel hammer must remain visible'
            assert np.mean((rgb[:, :, 2]-rgb[:, :, 0])[metal]) < 14, 'Hammer must be neutral steel, not blue anvil colour'
print('PASS: all 46 frames keep the complete native station, intact tool impacts, closed joins, crisp alpha, steady bench and distinct steel hammer.')
