import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";

import { User } from "../types";

type Props = {
  users: User[];
  value: string;
  onChange: (id: string) => void;
};

export default function UserSelect({ users, value, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  const selectedUser = users.find((u) => u.id === value);

  const handleSelect = (id: string) => {
    onChange(id);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setVisible(true)}
      >
        {selectedUser ? (
          <View style={styles.row}>
            <Image
              source={{ uri: selectedUser.avatar }}
              style={styles.avatar}
            />
            <Text>{selectedUser.name}</Text>
          </View>
        ) : (
          <Text style={{ color: "#666" }}>Selecione...</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => handleSelect(item.id)}
                >
                  <Image source={{ uri: item.avatar }} style={styles.avatar} />
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setVisible(false)}
            >
              <Text style={{ color: "#00465c", fontWeight: "bold" }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  cancelBtn: {
    padding: 12,
    alignItems: "center",
  },
});
