import React from 'react';
import { View, Text, Image } from 'react-native';

const steps = [
  { label: 'Order Placed', source: require('../../../assets/images/clock.png') },
  { label: 'Confirmed', source: require('../../../assets/images/check-mark.png') },
  { label: 'Shipped', source: require('../../../assets/images/shipped.png') },
  { label: 'Delivered', source: require('../../../assets/images/box.png') },
];

export default function DeliveryStatusBar({ status }: { status: string }) {
  const currentStep = steps.findIndex(
    s => s.label.replace(' ', '') === status.replace(' ', '')
  );

  return (
    <View className="">
      <Text className="font-bold text-lg mb-2">Delivery Status</Text>
      <View className="flex-row items-center justify-between mb-1">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStep;
          return (
            <View
              key={step.label}
              className="items-center flex-col flex-1 min-w-[60px] relative"
            >
              <View
                className={`w-10 h-10 rounded-full mb-1 z-20 flex items-center justify-center ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <Image
                  source={step.source}
                  className="w-5 h-5"
                  style={{ tintColor: '#fff' }}
                  resizeMode="contain"
                />
              </View>

              {idx < steps.length - 1 && (
                <View
                  className="absolute top-5 right-[-30px] w-[60px] h-1 z-10"
                  style={{ backgroundColor: isCompleted ? '#17a664' : '#e0e0e0' }}
                />
              )}

              <Text
                className={`text-xs mt-1 max-w-[75px] text-center ${
                  isCompleted ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
