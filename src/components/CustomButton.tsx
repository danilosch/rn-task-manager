import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

type CustomButtonProps = {
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
};

export default function CustomButton({
  variant = "primary",
  icon,
  title,
  accessibilityLabel,
  onPress,
}: CustomButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
      ]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
      <Text
        style={
          variant === "primary"
            ? styles.primaryButtonText
            : styles.secondaryButtonText
        }
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: "#00465c",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#e6f2f6",
    borderWidth: 1,
    borderColor: "#00465c",
  },
  secondaryButtonText: { color: "#00465c", fontWeight: "600" },
});
