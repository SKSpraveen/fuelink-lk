import React from 'react';
import { View, Text } from 'react-native';

export const Marker = ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>;
export const Callout = ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>;

const MapView = ({ children, style, ...props }: any) => (
  <View style={[style, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' }]} {...props}>
    <Text style={{ color: '#9CA3AF', marginBottom: 10 }}>Map view is not supported on web.</Text>
  </View>
);

export { MapView };
export default MapView;
