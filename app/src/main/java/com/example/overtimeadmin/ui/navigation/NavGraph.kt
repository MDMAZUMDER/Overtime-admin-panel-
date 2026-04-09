// File: app/src/main/java/com/example/overtimeadmin/ui/navigation/NavGraph.kt
package com.example.overtimeadmin.ui.navigation

import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.example.overtimeadmin.ui.MainViewModel
import com.example.overtimeadmin.ui.screens.*

@Composable
fun NavGraph(
    navController: NavHostController,
    viewModel: MainViewModel,
    snackbarHostState: SnackbarHostState
) {
    NavHost(navController = navController, startDestination = "home") {
        composable("home") {
            HomeScreen(viewModel, snackbarHostState)
        }
        composable("employees") {
            EmployeesScreen(viewModel)
        }
        composable("approvals") {
            ApprovalsScreen(viewModel, navController)
        }
        composable("profile") {
            ProfileScreen(snackbarHostState)
        }
        composable(
            route = "approvalDetail/{requestId}",
            arguments = listOf(navArgument("requestId") { type = NavType.IntType })
        ) { backStackEntry ->
            val requestId = backStackEntry.arguments?.getInt("requestId") ?: return@composable
            ApprovalDetailScreen(requestId, viewModel, navController, snackbarHostState)
        }
    }
}
