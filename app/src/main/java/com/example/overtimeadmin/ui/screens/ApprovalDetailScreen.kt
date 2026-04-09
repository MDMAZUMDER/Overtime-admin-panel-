// File: app/src/main/java/com/example/overtimeadmin/ui/screens/ApprovalDetailScreen.kt
package com.example.overtimeadmin.ui.screens

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.overtimeadmin.ui.MainViewModel
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApprovalDetailScreen(
    requestId: Int,
    viewModel: MainViewModel,
    navController: NavController,
    snackbarHostState: SnackbarHostState
) {
    val request = viewModel.getRequestById(requestId) ?: return
    val scope = rememberCoroutineScope()
    val view = LocalView.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Request Details") },
                navigationIcon = {
                    IconButton(onClick = { navController.navigateUp() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(request.employeeInitial, style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onPrimaryContainer)
            }
            Spacer(Modifier.height(16.dp))
            Text(request.employeeName, style = MaterialTheme.typography.headlineSmall)
            Spacer(Modifier.height(8.dp))
            Surface(
                color = MaterialTheme.colorScheme.secondaryContainer,
                shape = MaterialTheme.shapes.medium
            ) {
                Text(
                    "${request.date} • ${request.hours} hrs",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    style = MaterialTheme.typography.labelLarge
                )
            }
            Spacer(Modifier.height(32.dp))
            Text(
                "Reason for Overtime",
                modifier = Modifier.align(Alignment.Start),
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(Modifier.height(8.dp))
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                shape = MaterialTheme.shapes.medium
            ) {
                Text(
                    request.reason,
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyLarge
                )
            }
            Spacer(Modifier.weight(1f))
            Spacer(Modifier.height(32.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.REJECT)
                        viewModel.rejectRequest(requestId)
                        scope.launch {
                            snackbarHostState.showSnackbar("Request Rejected")
                            navController.navigateUp()
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text("Reject")
                }
                Button(
                    onClick = {
                        view.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                        viewModel.approveRequest(requestId)
                        scope.launch {
                            snackbarHostState.showSnackbar("Request Approved")
                            navController.navigateUp()
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF146C2E)), // Success color
                    shape = MaterialTheme.shapes.medium
                ) {
                    Text("Approve")
                }
            }
        }
    }
}
