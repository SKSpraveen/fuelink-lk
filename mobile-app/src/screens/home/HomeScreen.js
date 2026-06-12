import React, { useContext } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AuthContext } from "../../context/AuthContext";

const HomeScreen = () => {
  const { setUserToken } = useContext(AuthContext);

  const handleSignOut = () => {
    setUserToken(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome To Fuelink LK
      </Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: 200,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});