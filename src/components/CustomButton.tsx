import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";

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
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    padding: 12,
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
    borderColor: "#00465c",
    borderWidth: 1,
  },
  secondaryButtonText: { color: "#00465c", fontWeight: "600" },
});
