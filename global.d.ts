import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface TouchableOpacityProps {
    className?: string;
  }
  interface FlatListProps<ItemT> {
    contentContainerClassName?: string;
    columnWrapperClassName?: string;
  }
}
declare module '*.png' {
  const content: any;
  export default content;
}
