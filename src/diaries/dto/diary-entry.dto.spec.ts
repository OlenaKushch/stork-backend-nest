import {
  normalizeCreateDiaryInput,
  normalizeUpdateDiaryInput,
  parseEmotionIds,
} from './diary-entry.dto';

describe('diary-entry.dto', () => {
  it('maps frontend create payload to normalized input', () => {
    expect(
      normalizeCreateDiaryInput({
        title: 'Настрій',
        description: 'Сьогодні почувалась добре',
        emotions: ['3', '7'],
      }),
    ).toEqual({
      title: 'Настрій',
      content: 'Сьогодні почувалась добре',
      emotionIds: [3, 7],
    });
  });

  it('parses empty emotions array on update', () => {
    expect(parseEmotionIds(undefined, [])).toEqual([]);
  });

  it('maps frontend update payload', () => {
    expect(
      normalizeUpdateDiaryInput({
        title: 'Оновлено',
        description: 'Новий текст',
        emotions: ['2'],
      }),
    ).toEqual({
      title: 'Оновлено',
      content: 'Новий текст',
      emotionIds: [2],
    });
  });
});
