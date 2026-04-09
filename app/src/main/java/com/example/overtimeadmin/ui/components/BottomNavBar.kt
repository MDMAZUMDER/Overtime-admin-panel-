// File: app/src/main/java/com/example/overtimeadmin/ui/components/BottomNavBar.kt
package com.example.overtimeadmin.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState

sealed class Screen(val route: String, val label: String, val icon: @Composable () -> Unit) {
    object Home : Screen("home", "Shop", { Icon(Icons.Default.FlashOn, contentDescription = null) })
    object Employees : Screen("employees", "Explore", { Icon(Icons.Default.Visibility, contentDescription = null) })
    object Approvals : Screen("approvals", "Brands", { Icon(Icons.Default.Bookmark, contentDescription = null) })
    object Profile : Screen("profile", "Profile", { Icon(Icons.Default.Person, contentDescription = null) })
}

@Composable
fun BottomNavBar(navController: NavController) {
    val items = listOf(Screen.Home, Screen.Employees, Screen.Approvals, Screen.Profile)
    val navBackStackEntry = navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry.value?.destination?.route

    NavigationBar {
        items.forEach { screen ->
            NavigationBarItem(
                icon = screen.icon,
                label = { Text(screen.label) },
                selected = currentRoute == screen.route,
                onClick = {
                    if (currentRoute != screen.route) {
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.startDestinationId) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    }
}
