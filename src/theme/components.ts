import { defineStyle, defineStyleConfig, theme, ThemeComponents } from "@chakra-ui/react";

const components = {
  Input: {
    variants: {
      // override the default outline variant
      // https://github.com/chakra-ui/chakra-ui/discussions/2974#discussioncomment-1715417
      outline: (props) => {
        const defaultProps = theme.components.Input.variants?.outline(props);

        return {
          ...defaultProps,
          field: {
            ...defaultProps?.field,
            _focusVisible: {
              ...defaultProps?.field?._focusVisible,
              boxShadow: "none",
            },
          },
        };
      },
    },
    defaultProps: {
      focusBorderColor: "black",
    },
  },
  Button: defineStyleConfig({
    variants: {
      "black-ghost": defineStyle((props) => ({
        bgColor: "black",
        color: "white",
        borderWidth: "1px",
        borderColor: "transparent",
        _active: {
          bgColor: "white",
          color: "black",
          borderColor: "black",
        },
        _hover: {
          bgColor: "white",
          color: "black",
          borderColor: "black",
          _disabled: {
            bgColor: "gray.50",
            color: "gray.400",
            borderColor: "gray.200",
          },
        },
        _disabled: {
          opacity: 1,
          bgColor: "gray.50",
          color: "gray.400",
          borderColor: "gray.200",
        },
      })),
    },
  }),
  Card: {
    defaultProps: {
      variant: "outline",
    },
  },
} as ThemeComponents;

export default components;
