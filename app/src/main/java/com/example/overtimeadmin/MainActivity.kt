// File: app/src/main/java/com/example/overtimeadmin/MainActivity.kt
package com.example.overtimeadmin

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.rememberNavController
import com.example.overtimeadmin.ui.MainViewModel
import com.example.overtimeadmin.ui.components.BottomNavBar
import com.example.overtimeadmin.ui.navigation.NavGraph
import com.example.overtimeadmin.ui.theme.OvertimeAdminTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            OvertimeAdminTheme {
                val navController = rememberNavController()
                val viewModel: MainViewModel = viewModel()
                val snackbarHostState = remember { SnackbarHostState() }

                Scaffold(
                    bottomBar = { BottomNavBar(navController) },
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { innerPadding ->
                    NavGraph(
                        navController = navController,
                        viewModel = viewModel,
                        snackbarHostState = snackbarHostState
                    )
                }
            }
        }
    }
}
