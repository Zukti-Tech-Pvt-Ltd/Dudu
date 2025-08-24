import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const steps = [
  { label: 'Order Placed', icon: 'clock-outline' },
  { label: 'Confirmed', icon: 'check-circle-outline' },
  { label: 'Shipped', icon: 'truck-outline' },
  { label: 'Delivered', icon: 'cube-outline' },
];

export default function DeliveryStatusBar({ status }: { status: string }) {
  const currentStep = steps.findIndex(s => s.label.replace(' ', '') === status.replace(' ', ''));

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Delivery Status</Text>
      <View style={styles.statusBar}>
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          return (
            <View style={styles.stepContainer} key={step.label}>
              <View style={[
                  styles.circle,
                  { backgroundColor: isCompleted ? '#17a664' : '#e0e0e0' }
                ]}
              >
                <Icon name={step.icon} size={22} color="#fff" />
              </View>
              {idx < steps.length - 1 && (
                <View style={[
                  styles.line,
                  { backgroundColor: isCompleted ? '#17a664' : '#e0e0e0' }
                ]} />
              )}
              <Text style={[
                styles.label,
                { color: isCompleted ? '#17a664' : '#666' }
              ]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { margin: 10 },
  heading: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  stepContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    flex: 1,
    minWidth: 60,
    position: 'relative',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    zIndex: 2,
  },
  line: {
    position: 'absolute',
    top: 20,
    right: -30,
    width: 60,
    height: 4,
    zIndex: 1,
    backgroundColor: '#e0e0e0',
  },
  label: {
    fontSize: 13,
    marginTop: 3,
    textAlign: 'center',
    maxWidth: 75,
  },
});
