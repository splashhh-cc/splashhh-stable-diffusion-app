import { Flex } from '@chakra-ui/react';
import UnifiedCanvasBrushSize from './UnifiedCanvasBrushSize';
import UnifiedCanvasColorPicker from './UnifiedCanvasColorPicker';

export default function UnifiedCanvasBrushSettings() {
  return (
    <Flex columnGap="1rem" alignItems="center">
      <UnifiedCanvasBrushSize />
      <UnifiedCanvasColorPicker />
    </Flex>
  );
}
