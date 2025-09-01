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
  avatar: { borderRadius: 14, height: 28, marginRight: 8, width: 28 },
  cancelBtn: {
    alignItems: "center",
    padding: 12,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
    padding: 16,
  },
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "flex-end",
  },
  row: { alignItems: "center", flexDirection: "row", gap: 8 },
  selectButton: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  userItem: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    padding: 12,
  },
});
