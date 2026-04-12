// File: app/src/main/java/com/example/overtimeadmin/ui/screens/EmployeesScreen.kt
package com.example.overtimeadmin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Mail
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.navigation.NavController
import com.example.overtimeadmin.data.model.Employee
import com.example.overtimeadmin.data.model.EmployeeStatus
import com.example.overtimeadmin.ui.MainViewModel
import kotlin.math.cos
import kotlin.math.sin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeesScreen(viewModel: MainViewModel, navController: NavController) {
    val employees by viewModel.employees.collectAsState()
    var selectedFilter by remember { mutableStateOf("All") }
    var showAll by remember { mutableStateOf(false) }
    val scrollState = rememberScrollState()

    val filteredEmployees = employees.filter {
        when (selectedFilter) {
            "Active" -> it.status == EmployeeStatus.ACTIVE
            "On Break" -> it.status == EmployeeStatus.ON_BREAK
            else -> true
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = { 
                        if (showAll) showAll = false else navController.navigateUp() 
                    }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { /* Search action */ }) {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        }
    ) { padding ->
        if (showAll) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF8F9FE))
                    .padding(padding),
                contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Text(
                        "All Employees",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }
                items(filteredEmployees) { employee ->
                    EmployeeListItemCard(employee, onClick = {
                        navController.navigate("employeeDetail/${employee.id}")
                    })
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF8F9FE))
                    .padding(padding)
                    .verticalScroll(scrollState),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Title Section
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Employee Directory",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2D3142)
                    )
                    Text(
                        "See all",
                        style = MaterialTheme.typography.labelLarge,
                        color = Color.Gray,
                        modifier = Modifier.clickable { showAll = true }
                    )
                }

            // Filter Chips
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                listOf("All", "Active", "On Break").forEach { filter ->
                    EmployeeFilterChip(
                        label = filter,
                        isSelected = selectedFilter == filter,
                        onClick = { selectedFilter = filter }
                    )
                }
            }

            // Today Section
            Text(
                "Today",
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 8.dp),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF2D3142)
            )

            // Featured Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 8.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier.padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFFF0F2FF)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Mail, contentDescription = null, tint = Color(0xFF3F51B5))
                    }
                    Spacer(Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "New Request",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            "Overtime from Alex Chen",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                    Text(
                        "2.5h",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF3F51B5)
                    )
                }
            }

            Spacer(Modifier.height(32.dp))

            // Demo Employees for Circular Selector
            val demoEmployees = listOf(
                Employee(101, "Andrea", "Sales", EmployeeStatus.ACTIVE, 2.5, "A"),
                Employee(102, "John", "HR", EmployeeStatus.ACTIVE, 1.2, "J"),
                Employee(103, "Sarah", "IT", EmployeeStatus.ACTIVE, 3.0, "S"),
                Employee(104, "Michael", "Finance", EmployeeStatus.ACTIVE, 0.5, "M"),
                Employee(105, "Emma", "Marketing", EmployeeStatus.ACTIVE, 4.1, "E"),
                Employee(106, "David", "Support", EmployeeStatus.ACTIVE, 2.0, "D")
            )

            // Circular Employee Selector
            EmployeeCircularSelector(demoEmployees) { employee ->
                // navController.navigate("employeeDetail/${employee.id}")
            }

            Spacer(Modifier.height(40.dp))

            // Bottom Button
            Button(
                onClick = { /* See details of selected */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .height(56.dp),
                shape = RoundedCornerShape(20.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3F51B5))
            ) {
                Text("See Details", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            
            Spacer(Modifier.height(32.dp))
        }
    }
}
}

@Composable
fun EmployeeFilterChip(label: String, isSelected: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) Color(0xFF3F51B5) else Color.White,
        modifier = Modifier.height(36.dp),
        border = if (!isSelected) androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEEEEEE)) else null
    ) {
        Box(
            modifier = Modifier.padding(horizontal = 20.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                label,
                color = if (isSelected) Color.White else Color.Gray,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
            )
        }
    }
}

@Composable
fun EmployeeCircularSelector(employees: List<Employee>, onEmployeeClick: (Employee) -> Unit) {
    Box(
        modifier = Modifier
            .size(300.dp),
        contentAlignment = Alignment.Center
    ) {
        // Background Rings
        Box(
            modifier = Modifier
                .size(220.dp)
                .border(1.dp, Color(0xFFE0E5FF), CircleShape)
        )
        Box(
            modifier = Modifier
                .size(140.dp)
                .border(2.dp, Color(0xFFE0E5FF), CircleShape)
        )

        // Central Avatar
        val centralEmployee = employees.firstOrNull()
        centralEmployee?.let {
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .border(4.dp, Color.White, CircleShape)
                    .background(Color.White)
                    .clickable { onEmployeeClick(it) },
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = "https://picsum.photos/seed/${it.id}/200/200",
                    contentDescription = it.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
        }

        // Orbiting Avatars
        val orbitingEmployees = employees.drop(1).take(5)
        orbitingEmployees.forEachIndexed { index, employee ->
            val angle = (index * (360f / orbitingEmployees.size)) - 90f
            val radius = 110.dp
            
            val x = (radius.value * cos(Math.toRadians(angle.toDouble()))).dp
            val y = (radius.value * sin(Math.toRadians(angle.toDouble()))).dp

            Box(
                modifier = Modifier
                    .offset(x = x, y = y)
                    .size(56.dp)
                    .clip(CircleShape)
                    .border(2.dp, Color.White, CircleShape)
                    .background(Color.White)
                    .clickable { onEmployeeClick(employee) },
                contentAlignment = Alignment.Center
            ) {
                AsyncImage(
                    model = "https://picsum.photos/seed/${employee.id}/100/100",
                    contentDescription = employee.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeListItemCard(employee: Employee, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
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
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    employee.initial, 
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onPrimaryContainer, 
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    employee.name, 
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    employee.department, 
                    style = MaterialTheme.typography.bodySmall, 
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(8.dp))
                EmployeeStatusChip(employee.status)
            }
            Column(horizontalAlignment = Alignment.End) {
                Surface(
                    color = MaterialTheme.colorScheme.secondaryContainer,
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = "${employee.weeklyOvertime}h",
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
                Text(
                    "Weekly",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.outline,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

@Composable
fun EmployeeStatusChip(status: EmployeeStatus) {
    val (text, containerColor, contentColor) = when (status) {
        EmployeeStatus.ACTIVE -> Triple("Active", Color(0xFFE8F5E9), Color(0xFF2E7D32))
        EmployeeStatus.ON_BREAK -> Triple("On Break", Color(0xFFFFF3E0), Color(0xFFEF6C00))
    }

    Surface(
        color = containerColor,
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = contentColor
        )
    }
}
