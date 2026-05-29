import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";

import DashBoard from "./src/pages/Dashboard";
import Storage from "./src/pages/Storage";
import Cashier from "./src/pages/Cashier";
import Reports from "./src/pages/Reports";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Dashboard"
          component={DashBoard}
          />
        <Tab.Screen
          name="Estoque"
          component={Storage}
          />
        <Tab.Screen
          name="Caixa"
          component={Cashier}
          />
        <Tab.Screen
          name="Relatórios"
          component={Reports}
          />
      </Tab.Navigator>
    </NavigationContainer>
  );
}