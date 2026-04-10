// File: app/src/main/java/com/example/overtimeadmin/ui/screens/ProfileScreen.kt
package com.example.overtimeadmin.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.launch

@Composable
fun ProfileScreen(snackbarHostState: SnackbarHostState) {
    val scope = rememberCoroutineScope()
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5))
            .verticalScroll(scrollState)
            .padding(bottom = 100.dp)
    ) {
        // Header Section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(320.dp)
        ) {
            AsyncImage(
                model = "https://picsum.photos/seed/travel/800/600",
                contentDescription = null,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
            
            // Overlay for better text visibility
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.3f))
            )

            // Top Icons
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 48.dp, end = 24.dp),
                horizontalArrangement = Arrangement.End
            ) {
                IconButton(onClick = { }) {
                    Icon(Icons.Default.FavoriteBorder, contentDescription = null, tint = Color.White)
                }
                Box {
                    IconButton(onClick = { }) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = Color.White)
                    }
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .background(Color.Red, CircleShape)
                            .align(Alignment.TopEnd)
                            .offset(x = (-8).dp, y = 8.dp)
                    )
                }
            }

            // Profile Info
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 40.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                AsyncImage(
                    model = "https://picsum.photos/seed/miranda/200/200",
                    contentDescription = null,
                    modifier = Modifier
                        .size(96.dp)
                        .clip(CircleShape)
                        .background(Color.White),
                    contentScale = ContentScale.Crop
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    "Miranda West",
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    "Work hard in silence. Let your\nsuccess be the noise.",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.White.copy(alpha = 0.8f),
                    textAlign = TextAlign.Center,
                    lineHeight = 18.sp
                )
            }
        }

        // Menu Groups
        Column(
            modifier = Modifier
                .padding(horizontal = 24.dp)
                .offset(y = (-40).dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            ProfileMenuGroup(
                listOf(
                    MenuItemData("My Address", Icons.Default.LocationOn),
                    MenuItemData("Account", Icons.Default.Group)
                ),
                onItemClick = { scope.launch { snackbarHostState.showSnackbar("$it clicked") } }
            )

            ProfileMenuGroup(
                listOf(
                    MenuItemData("Notifications", Icons.Default.Notifications),
                    MenuItemData("Devices", Icons.Default.Smartphone),
                    MenuItemData("Passwords", Icons.Default.Key),
                    MenuItemData("Language", Icons.Default.Message)
                ),
                onItemClick = { scope.launch { snackbarHostState.showSnackbar("$it clicked") } }
            )
        }
    }
}

data class MenuItemData(val label: String, val icon: ImageVector)

@Composable
fun ProfileMenuGroup(items: List<MenuItemData>, onItemClick: (String) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            items.forEachIndexed { index, item ->
                ListItem(
                    headlineContent = { 
                        Text(
                            item.label, 
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF333333)
                        ) 
                    },
                    leadingContent = { 
                        Icon(
                            item.icon, 
                            contentDescription = null, 
                            tint = Color.LightGray,
                            modifier = Modifier.size(24.dp)
                        ) 
                    },
                    trailingContent = { 
                        Icon(
                            Icons.Default.ChevronRight, 
                            contentDescription = null, 
                            tint = Color.LightGray,
                            modifier = Modifier.size(20.dp)
                        ) 
                    },
                    modifier = Modifier.clickable { onItemClick(item.label) }
                )
                if (index < items.size - 1) {
                    HorizontalDivider(
                        modifier = Modifier.padding(horizontal = 16.dp),
                        color = Color(0xFFF5F5F5),
                        thickness = 1.dp
                    )
                }
            }
        }
    }
}
