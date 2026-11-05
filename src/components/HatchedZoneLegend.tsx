import { Flex, theme } from 'antd';

import { getHatchedPatternStyle } from './getHatchedPatternStyle';
import type { HatchedZone } from './types';

const SWATCH_SIZE = 14;

interface HatchedZoneLegendProps {
  zones: HatchedZone[];
}

/** Légende des zones hachurées qui ont un libellé : un carré rayé et son libellé. */
export function HatchedZoneLegend({ zones }: Readonly<HatchedZoneLegendProps>) {
  const { token } = theme.useToken();
  const legendZones = zones.filter((zone) => zone.legend);
  if (legendZones.length === 0) return null;

  return (
    <Flex wrap gap="middle" style={{ marginBottom: token.marginSM }}>
      {legendZones.map((zone) => (
        <Flex key={zone.key} align="center" gap="small">
          <span
            aria-hidden
            style={{
              ...getHatchedPatternStyle(zone.color),
              backgroundAttachment: 'scroll',
              display: 'inline-block',
              width: SWATCH_SIZE,
              height: SWATCH_SIZE,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadiusXS,
            }}
          />
          <span>{zone.legend}</span>
        </Flex>
      ))}
    </Flex>
  );
}
