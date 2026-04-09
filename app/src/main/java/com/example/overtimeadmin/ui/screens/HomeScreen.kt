// File: app/src/main/java/com/example/overtimeadmin/ui/screens/HomeScreen.kt
package com.example.overtimeadmin.ui.screens

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.overtimeadmin.data.model.OvertimeRequest
import com.example.overtimeadmin.data.repository.MockDataRepository
import com.example.overtimeadmin.ui.MainViewModel
import com.example.overtimeadmin.ui.components.SimpleLineChart
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(viewModel: MainViewModel, snackbarHostState: SnackbarHostState) {
    val pendingRequests by viewModel.pendingRequests.collectAsState()
    val totalHours = MockDataRepository.weeklyTrendData.sum()
    val scope = rememberCoroutineScope()
    var showBottomSheet by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Dashboard", style = MaterialTheme.typography.titleLarge) },
                actions = {
                    IconButton(onClick = {
                        scope.launch { snackbarHostState.showSnackbar("No new notifications") }
                    }) {
                        Icon(Icons.Default.Notifications, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { showBottomSheet = true }) {
                Icon(Icons.Default.Add, contentDescription = null)
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Summary Cards
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    item {
                        SummaryCard(
                            title = "Pending Approvals",
                            value = pendingRequests.size.toString(),
                            containerColor = MaterialTheme.colorScheme.primaryContainer
                        )
                    }
                    item {
                        SummaryCard(
                            title = "Total Company Hours",
                            value = String.format("%.1f", totalHours),
                            containerColor = MaterialTheme.colorScheme.secondaryContainer
                        )
                    }
                }
            }

            // Chart Section
            item {
                Column {
                    Text(
                        "Weekly Overtime Trend",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.padding(bottom = 8.dp)
                    )
                    Card(
                        shape = MaterialTheme.shapes.extraLarge,
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f))
                    ) {
                        SimpleLineChart(data = MockDataRepository.weeklyTrendData)
                    }
                }
            }

            // Quick Approval List
            item {
                Text(
                    "Quick Approvals",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            items(pendingRequests, key = { it.id }) { request ->
                SwipeableRequestItem(
                    request = request,
                    onApprove = {
                        viewModel.approveRequest(request.id)
                        scope.launch { snackbarHostState.showSnackbar("Approved ${request.employeeName}") }
                    },
                    onReject = {
                        viewModel.rejectRequest(request.id)
                        scope.launch { snackbarHostState.showSnackbar("Rejected ${request.employeeName}") }
                    }
                )
            }
        }

        if (showBottomSheet) {
            ModalBottomSheet(
                onDismissRequest = { showBottomSheet = false },
                sheetState = sheetState,
                shape = MaterialTheme.shapes.large
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp, start = 16.dp, end = 16.dp)
                ) {
                    ListItem(
                        headlineContent = { Text("Broadcast Message") },
                        modifier = Modifier.pointerInput(Unit) {
                            // Click handling
                        },
                        onClick = {
                            scope.launch {
                                snackbarHostState.showSnackbar("Broadcast sent!")
                                showBottomSheet = false
                            }
                        }
                    )
                    ListItem(
                        headlineContent = { Text("Generate Report") },
                        onClick = {
                            scope.launch {
                                snackbarHostState.showSnackbar("Report generating...")
                                showBottomSheet = false
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
fun SummaryCard(title: String, value: String, containerColor: Color) {
    Card(
        modifier = Modifier
            .width(200.dp)
            .height(140.dp),
        shape = MaterialTheme.shapes.extraLarge,
        colors = CardDefaults.cardColors(containerColor = containerColor)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(title, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f))
            Text(value, style = MaterialTheme.typography.headlineLarge, color = MaterialTheme.colorScheme.onPrimaryContainer)
        }
    }
}

@Composable
fun SwipeableRequestItem(
    request: OvertimeRequest,
    onApprove: () -> Unit,
    onReject: () -> Unit
) {
    val view = LocalView.current
    val offsetX = remember { Animatable(0f) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .pointerInput(Unit) {
                detectHorizontalDragGestures(
                    onDragEnd = {
                        if (offsetX.value > 300f) {
                            view.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                            onApprove()
                        } else if (offsetX.value < -300f) {
                            view.performHapticFeedback(HapticFeedbackConstants.REJECT)
                            onReject()
                        } else {
                            scope.launch { offsetX.animateTo(0f) }
                        }
                    },
                    onHorizontalDrag = { change, dragAmount ->
                        change.consume()
                        scope.launch { offsetX.snapTo(offsetX.value + dragAmount) }
                    }
                )
            }
    ) {
        Card(
            modifier = Modifier
                .offset { IntOffset(offsetX.value.roundToInt(), 0) }
                .fillMaxWidth(),
            shape = MaterialTheme.shapes.medium,
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Row(
                modifier = Modifier
                    .padding(16.dp)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.primaryContainer),
                    contentAlignment = Alignment.Center
                ) {
                    Text(request.employeeInitial, color = MaterialTheme.colorScheme.onPrimaryContainer, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(request.employeeName, style = MaterialTheme.typography.titleMedium)
                    Text("${request.hours} hrs • ${request.reason}", style = MaterialTheme.typography.bodySmall, maxLines = 1)
                }
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.padding(start = 8.dp)
                ) {
                    Text("↔️ Swipe", modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp), fontSize = 10.sp)
                }
            }
        }
    }
}
