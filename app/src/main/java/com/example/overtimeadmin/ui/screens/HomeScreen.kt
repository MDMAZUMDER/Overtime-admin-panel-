// File: app/src/main/java/com/example/overtimeadmin/ui/screens/HomeScreen.kt
package com.example.overtimeadmin.ui.screens

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.Animatable
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.navigation.NavController
import com.example.overtimeadmin.data.model.OvertimeRequest
import com.example.overtimeadmin.data.repository.MockDataRepository
import com.example.overtimeadmin.ui.MainViewModel
import com.example.overtimeadmin.ui.components.SimpleLineChart
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(viewModel: MainViewModel, navController: NavController, snackbarHostState: SnackbarHostState) {
    val pendingRequests by viewModel.pendingRequests.collectAsState()
    val employees by viewModel.employees.collectAsState()
    val totalHours = MockDataRepository.weeklyTrendData.sum()
    val totalCost = employees.sumOf { it.totalOvertime * it.hourlyRate }
    val scope = rememberCoroutineScope()

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {
            // Header Section
            item {
                HomeHeader(onProfileClick = { navController.navigate("profile") })
            }

            // Key Metrics Grid
            item {
                Column(modifier = Modifier.padding(horizontal = 20.dp)) {
                    Text(
                        "System Overview",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        MetricCard(
                            title = "Pending",
                            value = pendingRequests.size.toString(),
                            subtitle = "Requests",
                            icon = Icons.Default.List,
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary,
                            modifier = Modifier.weight(1f)
                        )
                        MetricCard(
                            title = "OT Cost",
                            value = "$${String.format("%,.0f", totalCost)}",
                            subtitle = "Total Est.",
                            icon = Icons.Default.AttachMoney,
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                            modifier = Modifier.weight(1.2f)
                        )
                    }
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        MetricCard(
                            title = "Active",
                            value = employees.count { it.status == EmployeeStatus.ACTIVE }.toString(),
                            subtitle = "Employees",
                            icon = Icons.Default.Person,
                            containerColor = MaterialTheme.colorScheme.surface,
                            contentColor = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f),
                            hasBorder = true
                        )
                        MetricCard(
                            title = "Weekly",
                            value = String.format("%.1f", totalHours),
                            subtitle = "Hours",
                            icon = Icons.Default.Schedule,
                            containerColor = MaterialTheme.colorScheme.surface,
                            contentColor = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.weight(1f),
                            hasBorder = true
                        )
                    }
                }
            }

            // Chart Section
            item {
                Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 24.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Overtime Analytics",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        Text(
                            "Last 7 Days",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.outline
                        )
                    }
                    Spacer(Modifier.height(16.dp))
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(24.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            SimpleLineChart(data = MockDataRepository.weeklyTrendData)
                        }
                    }
                }
            }

            // Quick Actions
            item {
                QuickActionsSection(onActionClick = { 
                    scope.launch { snackbarHostState.showSnackbar("$it feature coming soon!") }
                })
            }

            // Recent Requests Header
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Action Required",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    if (pendingRequests.isNotEmpty()) {
                        TextButton(onClick = { navController.navigate("approvals") }) {
                            Text("View All")
                        }
                    }
                }
            }

            if (pendingRequests.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            Icons.Default.CheckCircle, 
                            contentDescription = null, 
                            tint = Color(0xFF2E7D32),
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(Modifier.height(12.dp))
                        Text(
                            "No pending approvals", 
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                items(pendingRequests.take(3), key = { it.id }) { request ->
                    Box(modifier = Modifier.padding(horizontal = 20.dp, vertical = 6.dp)) {
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
            }
        }
    }
}

@Composable
fun HomeHeader(onProfileClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 32.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column {
            Text(
                "Welcome back,",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                "System Admin",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface,
                letterSpacing = (-0.5).sp
            )
        }
        Surface(
            modifier = Modifier
                .size(52.dp)
                .clip(CircleShape)
                .clickable { onProfileClick() },
            color = MaterialTheme.colorScheme.primaryContainer,
            border = androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.surface)
        ) {
            AsyncImage(
                model = "https://picsum.photos/seed/admin/100/100",
                contentDescription = "Profile",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    containerColor: Color,
    contentColor: Color,
    modifier: Modifier = Modifier,
    hasBorder: Boolean = false
) {
    Card(
        modifier = modifier.height(130.dp),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        border = if (hasBorder) androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant) else null
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = contentColor.copy(alpha = 0.7f),
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    title,
                    style = MaterialTheme.typography.labelMedium,
                    color = contentColor.copy(alpha = 0.7f),
                    fontWeight = FontWeight.Bold
                )
            }
            Column {
                Text(
                    value,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = contentColor,
                    letterSpacing = (-1).sp
                )
                Text(
                    subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = contentColor.copy(alpha = 0.6f),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun QuickActionsSection(onActionClick: (String) -> Unit) {
    Column(modifier = Modifier.padding(top = 24.dp)) {
                    Text(
                        "Quick Actions",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(start = 20.dp, end = 20.dp, bottom = 12.dp)
                    )
        LazyRow(
            contentPadding = PaddingValues(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            val actions = listOf(
                "Add Employee" to Icons.Default.Person,
                "Export PDF" to Icons.Default.Description,
                "Settings" to Icons.Default.Settings,
                "Support" to Icons.Default.Face
            )
            items(actions) { (label, icon) ->
                ActionChip(label, icon, onClick = { onActionClick(label) })
            }
        }
    }
}

@Composable
fun ActionChip(label: String, icon: ImageVector, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = Modifier.height(48.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(icon, contentDescription = null, modifier = Modifier.size(18.dp))
            Text(label, style = MaterialTheme.typography.labelLarge)
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
                            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                            onApprove()
                        } else if (offsetX.value < -300f) {
                            view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                            onReject()
                        } else {
                            scope.launch { offsetX.animateTo(0f) }
                        }
                    },
                    onHorizontalDrag = { change, dragAmount ->
                        change.consume()
                        val newOffset = (offsetX.value + dragAmount).coerceIn(-400f, 400f)
                        scope.launch { offsetX.snapTo(newOffset) }
                    }
                )
            }
    ) {
        // Background Actions
        Row(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(20.dp))
                .background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF146C2E), Color(0xFFBA1A1A))
                    )
                )
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(Icons.Default.Check, contentDescription = null, tint = Color.White)
            Icon(Icons.Default.Close, contentDescription = null, tint = Color.White)
        }

        // Foreground Content
        Card(
            modifier = Modifier
                .offset { IntOffset(offsetX.value.roundToInt(), 0) }
                .fillMaxWidth(),
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    Text(
                        request.employeeInitial, 
                        color = MaterialTheme.colorScheme.onPrimaryContainer, 
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        request.employeeName, 
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "${request.hours} hrs • ${request.reason}", 
                        style = MaterialTheme.typography.bodySmall, 
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1
                    )
                }
                Icon(
                    Icons.Default.ArrowForward, 
                    contentDescription = null, 
                    tint = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
                )
            }
        }
    }
}

@Composable
fun SimpleLineChart(data: List<Double>) {
    val primaryColor = MaterialTheme.colorScheme.primary
    
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
    ) {
        val width = size.width
        val height = size.height
        val maxVal = (data.maxOrNull() ?: 1.0) * 1.2
        val stepX = width / (data.size - 1)

        // Draw horizontal grid lines
        val gridLines = 4
        for (i in 0..gridLines) {
            val y = height - (i * height / gridLines)
            drawLine(
                color = Color.LightGray.copy(alpha = 0.3f),
                start = Offset(0f, y),
                end = Offset(width, y),
                strokeWidth = 1.dp.toPx()
            )
        }

        val points = data.mapIndexed { index, value ->
            Offset(index * stepX, height - (value.toFloat() / maxVal.toFloat() * height))
        }

        // Draw area under the line
        val fillPath = Path().apply {
            moveTo(points.first().x, height)
            points.forEach { lineTo(it.x, it.y) }
            lineTo(points.last().x, height)
            close()
        }
        
        drawPath(
            path = fillPath,
            brush = Brush.verticalGradient(
                colors = listOf(primaryColor.copy(alpha = 0.15f), Color.Transparent),
                startY = 0f,
                endY = height
            )
        )

        // Draw the line
        for (i in 0 until points.size - 1) {
            drawLine(
                color = primaryColor,
                start = points[i],
                end = points[i + 1],
                strokeWidth = 3.dp.toPx(),
                cap = StrokeCap.Round
            )
        }

        // Draw points
        points.forEach { point ->
            drawCircle(
                color = Color.White,
                radius = 5.dp.toPx(),
                center = point
            )
            drawCircle(
                color = primaryColor,
                radius = 3.dp.toPx(),
                center = point,
                style = Stroke(width = 2.dp.toPx())
            )
        }
    }
}

