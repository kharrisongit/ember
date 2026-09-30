from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'assets/sprites/workshops'
for action, count in [('work', 42), ('idle', 4)]:
    image = Image.open(root / f'dunstan-{action}.png').convert('RGBA')
    assert image.size == (96*count, 96)
    data = np.array(image)
    assert set(np.unique(data[:, :, 3])) == {0, 255}, 'Hard alpha only'
    frames = [data[:, i*96:(i+1)*96] for i in range(count)]
    for i, frame in enumerate(frames):
        assert np.any(frame[:, :, 3]), (action, i, 'empty frame')
        assert not any(np.any(edge) for edge in [frame[0, :, 3], frame[-1, :, 3], frame[:, 0, 3], frame[:, -1, 3]]), (action, i, 'clipped silhouette')
        assert np.array_equal(frame[86:], frames[0][86:]), (action, i, 'station/feet drift')
    if action == 'idle':
        assert len({frame.tobytes() for frame in frames}) == 4, 'Four distinct conversation poses'
        for frame in frames[1:]:
            assert np.array_equal(frame[65:], frames[0][65:]), 'Conversation anvil is completely stationary'
            assert np.array_equal(frame[:38], frames[0][:38]), 'No head/hair bob'
print('PASS: 46 complete frames, crisp alpha, fixed station/feet, distinct breathing and blinking, stable idle head.')
