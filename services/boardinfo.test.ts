import { CreateSegment, SegmentID, SegmentType, SegmentSection } from './boardinfo';

describe('CreateSegment', () => {
  describe('Regular segments (1-20)', () => {
    it('should create a single segment correctly', () => {
      const segment = CreateSegment(SegmentID.INNER_20);

      expect(segment.ID).toBe(SegmentID.INNER_20);
      expect(segment.Type).toBe(SegmentType.Single);
      expect(segment.Section).toBe(20);
      expect(segment.Value).toBe(20);
      expect(segment.ShortName).toBe('20');
      expect(segment.LongName).toBe(' 20');
    });

    it('should create a double segment correctly', () => {
      const segment = CreateSegment(SegmentID.DBL_20);

      expect(segment.ID).toBe(SegmentID.DBL_20);
      expect(segment.Type).toBe(SegmentType.Double);
      expect(segment.Section).toBe(20);
      expect(segment.Value).toBe(40);
      expect(segment.ShortName).toBe('D20');
      expect(segment.LongName).toBe('Double 20');
    });

    it('should create a triple segment correctly', () => {
      const segment = CreateSegment(SegmentID.TRP_20);

      expect(segment.ID).toBe(SegmentID.TRP_20);
      expect(segment.Type).toBe(SegmentType.Triple);
      expect(segment.Section).toBe(20);
      expect(segment.Value).toBe(60);
      expect(segment.ShortName).toBe('T20');
      expect(segment.LongName).toBe('Triple 20');
    });

    it('should calculate correct values for different sections', () => {
      const single5 = CreateSegment(SegmentID.INNER_5);
      const double5 = CreateSegment(SegmentID.DBL_5);
      const triple5 = CreateSegment(SegmentID.TRP_5);

      expect(single5.Value).toBe(5);
      expect(double5.Value).toBe(10);
      expect(triple5.Value).toBe(15);
    });
  });

  describe('Bullseye segments', () => {
    it('should create single bull correctly', () => {
      const segment = CreateSegment(SegmentID.BULL);

      expect(segment.ID).toBe(SegmentID.BULL);
      expect(segment.Type).toBe(SegmentType.Single);
      expect(segment.Section).toBe(SegmentSection.BULL);
      expect(segment.Value).toBe(25);
      expect(segment.ShortName).toBe('BULL');
      expect(segment.LongName).toBe(' Bullseye');
    });

    it('should create double bull correctly', () => {
      const segment = CreateSegment(SegmentID.DBL_BULL);

      expect(segment.ID).toBe(SegmentID.DBL_BULL);
      expect(segment.Type).toBe(SegmentType.Double);
      expect(segment.Section).toBe(SegmentSection.BULL);
      expect(segment.Value).toBe(50);
      expect(segment.ShortName).toBe('DBULL');
      expect(segment.LongName).toBe('Double Bullseye');
    });
  });

  describe('Special segments', () => {
    it('should create reset button segment correctly', () => {
      const segment = CreateSegment(SegmentID.RESET_BUTTON);

      expect(segment.ID).toBe(SegmentID.RESET_BUTTON);
      expect(segment.Type).toBe(SegmentType.Other);
      expect(segment.Section).toBe(SegmentSection.Other);
      expect(segment.Value).toBe(0);
      expect(segment.ShortName).toBe('RST');
      expect(segment.LongName).toBe('Reset Button');
    });

    it('should create miss segment correctly', () => {
      const segment = CreateSegment(SegmentID.MISS);

      expect(segment.ID).toBe(SegmentID.MISS);
      expect(segment.Type).toBe(SegmentType.Other);
      expect(segment.Section).toBe(SegmentSection.Other);
      expect(segment.Value).toBe(0);
      expect(segment.ShortName).toBe('Miss');
      expect(segment.LongName).toBe('Miss');
    });

    it('should create bust segment correctly', () => {
      const segment = CreateSegment(SegmentID.BUST);

      expect(segment.ID).toBe(SegmentID.BUST);
      expect(segment.Type).toBe(SegmentType.Other);
      expect(segment.Section).toBe(SegmentSection.Other);
      expect(segment.Value).toBe(0);
      expect(segment.ShortName).toBe('Bust');
      expect(segment.LongName).toBe('Bust');
    });
  });

  describe('Cricket numbers', () => {
    it('should handle all cricket numbers correctly', () => {
      const cricketNumbers = [15, 16, 17, 18, 19, 20];

      cricketNumbers.forEach(num => {
        const singleId = (num - 1) * 4; // INNER segment
        const segment = CreateSegment(singleId);
        expect(segment.Section).toBe(num);
      });
    });
  });
});
