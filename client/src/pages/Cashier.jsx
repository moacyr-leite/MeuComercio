import { View, Text } from "react-native";
import Scanner from "../components/Scanner";

export default function Cashier() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Scanner />
    </View>
  );
}