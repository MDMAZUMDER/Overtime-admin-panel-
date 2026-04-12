// File: app/src/main/java/com/example/overtimeadmin/ui/screens/EmployeeDetailScreen.kt
package com.example.overtimeadmin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.overtimeadmin.data.model.Employee
import com.example.overtimeadmin.data.model.EmployeeStatus
import com.example.overtimeadmin.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDetailScreen(employeeId: Int, viewModel: MainViewModel, navController: NavController) {
    val employees by viewModel.employees.collectAsState()
    val employee = employees.find { it.id == employeeId } ?: return

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Employee Profile", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Edit */ }) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit")
                    }
                    IconButton(onClick = { /* More */ }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "More")
                    }
                }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            // Profile Header
            item {
                ProfileHeader(employee)
            }

            // Stats Section
            item {
                EmployeeStatsSection(employee)
            }

            // Contact Info
            item {
                InfoSection(
                    title = "Contact Information",
                    items = listOf(
                        InfoItemData("Email", employee.email, Icons.Default.Email),
                        InfoItemData("Phone", employee.phone, Icons.Default.Phone),
                        InfoItemData("Department", employee.department, Icons.Default.Business),
                        InfoItemData("Position", employee.position, Icons.Default.Badge)
                    )
                )
            }

            // Employment Details
            item {
                InfoSection(
                    title = "Employment Details",
                    items = listOf(
                        InfoItemData("Join Date", employee.joinDate, Icons.Default.CalendarToday),
                        InfoItemData("Hourly Rate", "$${employee.hourlyRate}/hr", Icons.Default.AttachMoney),
                        InfoItemData("Status", if (employee.status == EmployeeStatus.ACTIVE) "Active" else "On Break", Icons.Default.Info)
                    )
                )
            }

            // Recent OT History Header
            item {
                Text(
                    "Recent Overtime History",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)
                )
            }

            // Mock History
            items(listOf(1, 2, 3)) { i ->
                HistoryItem(
                    date = "Oct ${10 - i}, 2023",
                    hours = "${4 + i}.0h",
                    status = if (i == 1) "Approved" else "Completed",
                    reason = "Project Alpha Deadline"
                )
            }
            
            // Admin Actions
            item {
                Spacer(Modifier.height(24.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedButton(
                        onClick = { /* Deactivate */ },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = MaterialTheme.colorScheme.error),
                        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.error)
                    ) {
                        Text("Deactivate")
                    }
                    Button(
                        onClick = { /* Generate Report */ },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text("Generate Report")
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileHeader(employee: Employee) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            modifier = Modifier.size(120.dp),
            shape = CircleShape,
            color = MaterialTheme.colorScheme.primaryContainer,
            border = androidx.compose.foundation.BorderStroke(4.dp, MaterialTheme.colorScheme.surface)
        ) {
            AsyncImage(
                model = "https://picsum.photos/seed/${employee.id}/200/200",
                contentDescription = employee.name,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }
        Spacer(Modifier.height(16.dp))
        Text(
            employee.name,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            employee.position,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(8.dp))
        Surface(
            color = if (employee.status == EmployeeStatus.ACTIVE) Color(0xFFE8F5E9) else Color(0xFFFFF3E0),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                if (employee.status == EmployeeStatus.ACTIVE) "ACTIVE" else "ON BREAK",
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = if (employee.status == EmployeeStatus.ACTIVE) Color(0xFF2E7D32) else Color(0xFFE65100)
            )
        }
    }
}

@Composable
fun EmployeeStatsSection(employee: Employee) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        StatBox(
            label = "Weekly",
            value = "${employee.weeklyOvertime}h",
            modifier = Modifier.weight(1f)
        )
        StatBox(
            label = "Monthly",
            value = "${employee.monthlyOvertime}h",
            modifier = Modifier.weight(1f)
        )
        StatBox(
            label = "Total",
            value = "${employee.totalOvertime}h",
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun StatBox(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                value,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                label,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

data class InfoItemData(val label: String, val value: String, val icon: ImageVector)

@Composable
fun InfoSection(title: String, items: List<InfoItemData>) {
    Column(modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp)) {
        Text(
            title,
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 12.dp)
        )
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))
        ) {
            Column {
                items.forEachIndexed { index, item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            item.icon,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.6f),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(Modifier.width(16.dp))
                        Column {
                            Text(
                                item.label,
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.outline
                            )
                            Text(
                                item.value,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                    if (index < items.size - 1) {
                        Divider(
                            modifier = Modifier.padding(horizontal = 16.dp),
                            color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HistoryItem(date: String, hours: String, status: String, reason: String) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 6.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(date, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Text(reason, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.outline)
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(hours, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold, color = MaterialTheme.colorScheme.primary)
                Text(status, style = MaterialTheme.typography.labelSmall, color = if (status == "Approved") Color(0xFF2E7D32) else Color.Gray)
            }
        }
    }
}
