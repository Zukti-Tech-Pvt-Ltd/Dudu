import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { Video as VideoIcon, Camera, X, Check } from 'lucide-react-native';

const Label = ({ text, colors }: { text: string; colors: any }) => (
  <Text style={{ color: colors.textSecondary }} className="font-semibold mb-2">
    {text}
  </Text>
);

export const ImageManager = ({
  images,
  thumbnail,
  setThumbnail,
  onPick,
  onCapture,
  onRemove,
  colors,
}: any) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  return (
    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
      <Label text="Product Images" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 10 }}
      >
        {images.map((img: any, index: number) => {
          const isSelected = thumbnail?.uri === img.uri;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onLongPress={() => setSelectedIdx(index)}
              onPress={() => {
                if (selectedIdx !== null) setSelectedIdx(null);
                else setThumbnail(img);
              }}
              style={{
                marginRight: 10,
                position: 'relative',
                borderWidth: isSelected ? 3 : 0,
                borderColor: '#007bff',
                borderRadius: 12,
              }}
            >
              <Image
                source={{ uri: img.uri }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  opacity: selectedIdx === index ? 0.7 : 1,
                  backgroundColor: colors.inputBg,
                }}
              />
              {isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                    backgroundColor: '#007bff',
                    borderRadius: 10,
                    padding: 2,
                  }}
                >
                  <Check size={12} color="#fff" />
                </View>
              )}
              {selectedIdx === index && (
                <TouchableOpacity
                  onPress={() => {
                    onRemove(index, img);
                    setSelectedIdx(null);
                  }}
                  style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 15,
                    padding: 4,
                  }}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={onPick}
          style={{
            flex: 1,
            backgroundColor: '#007bff',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', textAlign: 'center' }}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCapture}
          style={{
            padding: 10,
            borderRadius: 10,
            backgroundColor: colors.inputBg,
          }}
        >
          <VideoIcon size={28} color={colors.iconColor} />
          {/* Note: In original code VideoIcon was used here, assuming Camera icon desired? Swapped to Camera below for clarity if needed */}
        </TouchableOpacity>
      </View>

      {thumbnail && (
        <View style={{ marginBottom: 20 }}>
          <Label text="Selected Thumbnail" colors={colors} />
          <View style={{ alignItems: 'center' }}>
            <Image
              source={{ uri: thumbnail.uri }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 10,
                resizeMode: 'cover',
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.inputBg,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};
