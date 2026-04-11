package com.example.overtimeadmin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.overtimeadmin.data.model.Employee
import com.example.overtimeadmin.data.model.OvertimeRequest
import com.example.overtimeadmin.ui.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeDetailScreen(
    employeeId: Int,
    viewModel: MainViewModel,
    navController: NavController
) {
    val employees by viewModel.employees.collectAsState()
    val employee = employees.find { it.id == employeeId } ?: return

    Scaffold(
        containerColor = Color(0xFFF8F9FE)
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Top Header Card
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(bottomStart = 48.dp, bottomEnd = 48.dp),
                shadowElevation = 2.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Custom Top Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { navController.navigateUp() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color(0xFF2D3142))
                        }
                        IconButton(onClick = { /* More actions */ }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More", tint = Color(0xFF2D3142))
                        }
                    }

                    // Profile Info
                    Box(
                        modifier = Modifier
                            .size(112.dp)
                            .clip(CircleShape)
                            .border(4.dp, Color.White, CircleShape)
                            .background(Color(0xFFF0F2FF)),
                        contentAlignment = Alignment.Center
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
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2D3142)
                    )
                    Text(
                        employee.department,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray,
                        fontWeight = FontWeight.Medium
                    )

                    Spacer(Modifier.height(32.dp))

                    // Metrics Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        MetricItem(label = "Income", value = "$${(employee.weeklyOvertime * 45).toInt()}")
                        VerticalDivider(modifier = Modifier.height(40.dp).width(1.dp), color = Color(0xFFF0F2FF))
                        MetricItem(label = "Expenses", value = "$${(employee.weeklyOvertime * 12).toInt()}")
                        VerticalDivider(modifier = Modifier.height(40.dp).width(1.dp), color = Color(0xFFF0F2FF))
                        MetricItem(label = "Loan", value = "$890")
                    }
                }
            }

            // Overview Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            "Overview",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF2D3142)
                        )
                        Spacer(Modifier.width(8.dp))
                        Icon(
                            Icons.Default.Notifications,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp),
                            tint = Color(0xFFE0E0E0)
                        )
                    }
                    Text(
                        "Sept 13, 2020",
                        style = MaterialTheme.typography.labelMedium,
                        color = Color.Gray,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(Modifier.height(24.dp))

                // Overview Items
                OverviewItem(
                    icon = Icons.Default.ArrowUpward,
                    label = "Sent",
                    subLabel = "Sending Payment to Clients",
                    amount = "$150"
                )
                Spacer(Modifier.height(16.dp))
                OverviewItem(
                    icon = Icons.Default.ArrowDownward,
                    label = "Receive",
                    subLabel = "Receiving Salary from company",
                    amount = "$250"
                )
                Spacer(Modifier.height(16.dp))
                OverviewItem(
                    icon = Icons.Default.CreditCard,
                    label = "Loan",
                    subLabel = "Loan for the Car",
                    amount = "$400"
                )
            }
        }
    }
}

@Composable
fun MetricItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color(0xFF2D3142))
        Text(label, style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun OverviewItem(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String, subLabel: String, amount: String) {
    Surface(
        color = Color.White,
        shape = RoundedCornerShape(32.dp),
        shadowElevation = 0.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFFF5F5F5)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = Color(0xFF2D3142), modifier = Modifier.size(20.dp))
                }
                Spacer(Modifier.width(16.dp))
                Column {
                    Text(label, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF2D3142))
                    Text(subLabel, style = MaterialTheme.typography.labelSmall, color = Color.Gray, fontWeight = FontWeight.Medium)
                }
            }
            Text(amount, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, color = Color(0xFF2D3142))
        }
    }
}

// Mock data for history
fun getMockHistory(employeeId: Int): List<OvertimeRequest> {
    return listOf(
        OvertimeRequest(101, employeeId, "", "", 2.0, "Oct 10, 2023", "Project deadline support"),
        OvertimeRequest(102, employeeId, "", "", 1.5, "Oct 08, 2023", "System maintenance"),
        OvertimeRequest(103, employeeId, "", "", 3.0, "Oct 05, 2023", "Client meeting preparation")
    )
}
