// game.js - Castro's Revolution FPS Game

// Vector classes for 3D mathematics
class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  
  add(v) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }
  
  subtract(v) {
    return new Vector2(this.x - v.x, this.y - v.y);
  }
  
  multiply(scalar) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector2();
    return new Vector2(this.x / mag, this.y / mag);
  }
}

class Vector3 {
  constructor(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }
  
  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  
  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  
  multiply(scalar) {
    return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
  }
  
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  normalize() {
    const mag = this.magnitude();
    if (mag === 0) return new Vector3();
    return new Vector3(this.x / mag, this.y / mag, this.z / mag);
  }
  
  cross(v) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
}

// Game Controller for handling inputs (keyboard, mouse, touch)
class GameController {
  constructor() {
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.isPointerLocked = false;
    
    // Touch controls state
    this.upPressed = false;
    this.downPressed = false;
    this.leftPressed = false;
    this.rightPressed = false;
    this.shootPressed = false;
    this.jumpPressed = false;
    
    // Mobile detection
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Initialize controls
    this.setupKeyboardControls();
    this.setupMouseControls();
    
    if (this.isMobile) {
      this.setupMobileControls();
    }
  }
  
  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }
  
  setupMouseControls() {
    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDeltaX = e.movementX || 0;
        this.mouseDeltaY = e.movementY || 0;
      }
    });
    
    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        this.keys['MouseLeft'] = true;
      }
    });
    
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left mouse button
        this.keys['MouseLeft'] = false;
      }
    });
    
    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement !== null;
    });
  }
  
  setupMobileControls() {
    // Setup touch events for mobile controls
    const moveUp = document.getElementById('moveUp');
    const moveDown = document.getElementById('moveDown');
    const moveLeft = document.getElementById('moveLeft');
    const moveRight = document.getElementById('moveRight');
    const shootBtn = document.getElementById('shootButton');
    const jumpBtn = document.getElementById('jumpButton');
    
    // Movement: Up
    moveUp.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.upPressed = true;
    });
    moveUp.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.upPressed = false;
    });
    
    // Movement: Down
    moveDown.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.downPressed = true;
    });
    moveDown.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.downPressed = false;
    });
    
    // Movement: Left
    moveLeft.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.leftPressed = true;
    });
    moveLeft.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.leftPressed = false;
    });
    
    // Movement: Right
    moveRight.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.rightPressed = true;
    });
    moveRight.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.rightPressed = false;
    });
    
    // Action: Shoot
    shootBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.shootPressed = true;
    });
    shootBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.shootPressed = false;
    });
    
    // Action: Jump
    jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.jumpPressed = true;
    });
    jumpBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.jumpPressed = false;
    });
    
    // Touch for look controls (right side of screen)
    const canvas = document.getElementById('gameCanvas');
    let touchStartX = 0;
    let touchStartY = 0;
    
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      // Only use touches on the right half of screen for looking
      if (touch.clientX > window.innerWidth / 2) {
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    });
    
    canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      // Only use touches on the right half of screen for looking
      if (touch.clientX > window.innerWidth / 2) {
        this.mouseDeltaX = touch.clientX - touchStartX;
        this.mouseDeltaY = touch.clientY - touchStartY;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }
    });
  }
  
  // Input state checkers
  isUpPressed() {
    return this.keys['KeyW'] || this.upPressed;
  }
  
  isDownPressed() {
    return this.keys['KeyS'] || this.downPressed;
  }
  
  isLeftPressed() {
    return this.keys['KeyA'] || this.leftPressed;
  }
  
  isRightPressed() {
    return this.keys['KeyD'] || this.rightPressed;
  }
  
  isJumpPressed() {
    return this.keys['Space'] || this.jumpPressed;
  }
  
  isShootPressed() {
    return this.keys['MouseLeft'] || this.shootPressed;
  }
  
  // Get look delta and reset it
  getLookDelta() {
    const delta = new Vector2(this.mouseDeltaX, this.mouseDeltaY);
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return delta;
  }
  
  // Request pointer lock on canvas
  requestPointerLock(canvas) {
    if (!this.isMobile) {
      canvas.requestPointerLock = canvas.requestPointerLock || 
                                  canvas.mozRequestPointerLock ||
                                  canvas.webkitRequestPointerLock;
      canvas.requestPointerLock();
    }
  }
}

// Texture and resource management
class ResourceManager {
  constructor() {
    this.textures = {};
    this.sounds = {};
    this.models = {};
    this.loaded = false;
    this.totalResources = 0;
    this.loadedResources = 0;
  }
  
  loadTexture(name, url) {
    this.totalResources++;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.textures[name] = img;
        this.loadedResources++;
        this.updateLoadingProgress();
        resolve(img);
      };
      img.onerror = (err) => {
        console.error(`Failed to load texture: ${url}`);
        reject(err);
      };
      img.src = url;
    });
  }
  
  updateLoadingProgress() {
    const progressElement = document.getElementById('loadingProgress');
    if (progressElement) {
      const progress = Math.floor((this.loadedResources / this.totalResources) * 100);
      progressElement.textContent = `${progress}%`;
      
      if (this.loadedResources === this.totalResources) {
        this.loaded = true;
      }
    }
  }
  
  async loadAllResources() {
    try {
      // Load textures (simple colored blocks for now)
      await Promise.all([
        this.loadTexture('wall', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAwElEQVQ4T2NkYGBgqK6u/v/jxw9GXl5eRlLBfxiDEaSZVMNhaiETSAUzMzMj4+vXr5nExMQYSdEM0gPXADOMVEPwGYIcDQQNABmCzKbEEJjLYAYQDEaQQchsfBrxGQIzBKsBII2khBnMEIIGwJyJzyCQS9ANIWgAzAZkQ5DFCCVjoObCwsL/N2/eZProEoSIGbLCENkl2FyFkpBgfGRN2FyBVyCBwoLA69ev/z98+JBRQ0MDrwEEo5FqmQkA1v6gEV6SCBEAAAAASUVORK5CYII='),
        this.loadTexture('floor', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAn0lEQVQ4T2NkgID/DAwMjDAaH8DIyMiITw6mB2wAIQNgmq2trRmPHz/OwIpkCFF+RjYE2QCiXQBTjGwIyYaA9MAMIdkAkIkg70tLSzN++/YNI0BJNgDZEKINAGlCNoQoA8gxhCQDkA0h2gXohhBlALIhRLsA5JTS0lJQCD1iZGfnZ2BgYCLFIxixBDIEphgkRqwLYPpAhpAUiDDNpNAA5dx9EW6NTNIAAAAASUVORK5CYII='),
        this.loadTexture('ceiling', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAnElEQVQ4T2NsaGj4z8DAwFhcXMyITeMDjI2NjYzE6EVWAxMnyhCYZpDm49uPMzIzMv/nFuJmJNYQmOEwzYxMTEyMr1+/ZxQXl2QkxhCY5sUL5zMyMqLoRzEAZggxhsBcATMMrwHIhhBrCMwQvC5ANgSbIchyMENAavAagGwIsiEgOZABIENAcgQNgLkEZAiyl0Fq8BpAMBhJlQQAXv+REbVZ+W8AAAAASUVORK5CYII='),
        this.loadTexture('enemy', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA30lEQVQ4T2NsaGj4z4AH1NfVMzY1NTHik0eRNzY2ZiTGAGTNyPowDMDmTGziyC7CaQCyRmxiyJ7CaQA2zdjEkQ3BaQA2jdjEYIYQNACbJmxi6IYQNACbBmxiBF2AzQBsYiCDsLoAmwZsYsguQTEAmwZsYsiqUQzApgGbGLrr0aMBmwZsYthiAS0asGnAJoaSjDAMwKYBmxhyLMEDEZsGbGLoeRMlHWDTgE0MOU9g5Eh0A7CJIxuCEsjIBmATRzYEIxBRYoKBwdXVlRFZDJc4Rk5Ejgl0Q3Bmpe/fv4NocgByLjsxjZGb8wAAAABJRU5ErkJggg=='),
        this.loadTexture('weapon', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAr0lEQVQ4T2NsbGz8z0AErKurYyTWEJg+sMtINgSmmWQDQBpBEUmsIdDwJt0L2AwhRTNWF+AzRF9fn1FXV5fx1atXjB8/fmRkY2PD8B5eA7AZAjL1ypUrjIKCgsoXLlzYAjKEKAPQDUF2CcwQogxANwTdJTBDiDIA3RB0l8AMIcqA+vp6Rm1tbYbXr1+DbcfmEqINABkAcjtIdXFxMTQlMjASm5LRjEH2Psn5ASQBAGNrZhEaZ6FeAAAAAElFTkSuQmCC')
      ]);
      
      console.log('All resources loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading resources:', error);
      return false;
    }
  }
  
  getTexture(name) {
    return this.textures[name];
  }
}

// Map & level management
class Level {
  constructor() {
    // Simple map layout: 1 = wall, 0 = empty space
    this.map = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    this.entities = [];
    this.spawnEnemies();
  }
  
  spawnEnemies() {
    // Spawn some enemies at random positions
    for (let i = 0; i < 5; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (this.map[0].length - 2)) + 1;
        y = Math.floor(Math.random() * (this.map.length - 2)) + 1;
      } while (this.map[y][x] !== 0);
      
      this.entities.push(new Enemy(x + 0.5, y + 0.5));
    }
  }
  
  // Check if a position is valid (not inside a wall)
  isPositionValid(x, y) {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);
    
    // Check boundaries
    if (gridX < 0 || gridX >= this.map[0].length || 
        gridY < 0 || gridY >= this.map.length) {
      return false;
    }
    
    // Check walls
    return this.map[gridY][gridX] === 0;
  }
  
  // Cast a ray from origin in a direction and return hit info
  castRay(origin, direction, maxDistance) {
    // DDA (Digital Differential Analysis) algorithm for ray casting
    const rayDir = direction.normalize();
    
    // Calculate the length of ray from one x or y-side to next x or y-side
    const deltaDistX = Math.abs(1 / rayDir.x);
    const deltaDistY = Math.abs(1 / rayDir.y);
    
    // Starting grid cell
    let mapX = Math.floor(origin.x);
    let mapY = Math.floor(origin.y);
    
    // Length of ray from current position to next x or y-side
    let sideDistX, sideDistY;
    
    // Direction to step in x or y direction (either +1 or -1)
    let stepX, stepY;
    
    // Calculate step and initial sideDist
    if (rayDir.x < 0) {
      stepX = -1;
      sideDistX = (origin.x - mapX) * deltaDistX;
    } else {
      stepX = 1;
      sideDistX = (mapX + 1.0 - origin.x) * deltaDistX;
    }
    
    if (rayDir.y < 0) {
      stepY = -1;
      sideDistY = (origin.y - mapY) * deltaDistY;
    } else {
      stepY = 1;
      sideDistY = (mapY + 1.0 - origin.y) * deltaDistY;
    }
    
    // Perform DDA
    let hit = false;
    let side = 0; // 0 for NS wall, 1 for EW wall
    let distance = 0;
    
    while (!hit && distance < maxDistance) {
      // Jump to next map square
      if (sideDistX < sideDistY) {
        sideDistX += deltaDistX;
        mapX += stepX;
        side = 0;
        distance = sideDistX - deltaDistX;
      } else {
        sideDistY += deltaDistY;
        mapY += stepY;
        side = 1;
        distance = sideDistY - deltaDistY;
      }
      
      // Check if ray has hit a wall
      if (mapY < 0 || mapX < 0 || mapY >= this.map.length || mapX >= this.map[0].length) {
        hit = true; // Hit boundary
      } else if (this.map[mapY][mapX] > 0) {
        hit = true; // Hit wall
      }
    }
    
    if (hit) {
      // Calculate exact hit point
      let wallX;
      if (side === 0) {
        wallX = origin.y + distance * rayDir.y;
      } else {
        wallX = origin.x + distance * rayDir.x;
      }
      wallX -= Math.floor(wallX);
      
      return {
        hit: true,
        distance: distance,
        side: side,
        wallX: wallX,
        mapX: mapX,
        mapY: mapY
      };
    }
    
    return { hit: false, distance: maxDistance };
  }
  
  update(deltaTime, player) {
    // Update all entities
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update(deltaTime, player, this);
      
      // Remove dead entities
      if (entity.health <= 0) {
        this.entities.splice(i, 1);
      }
    }
  }
}

// Base entity class
class Entity {
  constructor(x, y) {
    this.position = new Vector3(x, 0.5, y);
    this.health = 100;
  }
  
  update(deltaTime) {
    // Base update method
  }
  
  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }
}

// Enemy class
class Enemy extends Entity {
  constructor(x, y) {
    super(x, y);
    this.speed = 0.5 + Math.random() * 0.5; // Random speed between 0.5 and 1.0
    this.state = 'patrol';
    this.patrolTimer = 0;
    this.patrolDirection = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    this.detectionRange = 5.0;
  }
  
  update(deltaTime, player, level) {
    // Calculate distance to player
    const toPlayer = player.position.subtract(this.position);
    const distToPlayer = toPlayer.magnitude();
    
    // Check if player is in line of sight
    let canSeePlayer = false;
    if (distToPlayer < this.detectionRange) {
      const rayInfo = level.castRay(
        this.position, 
        toPlayer.normalize(), 
        distToPlayer
      );
      canSeePlayer = !rayInfo.hit;
    }
    
    // State machine
    if (canSeePlayer) {
      this.state = 'chase';
    } else if (this.state === 'chase' && !canSeePlayer) {
      this.state = 'patrol';
    }
    
    // Behavior based on state
    if (this.state === 'chase') {
      // Move towards player
      const moveDir = toPlayer.normalize();
      const nextPos = this.position.add(moveDir.multiply(this.speed * deltaTime));
      
      // Collision check
      if (level.isPositionValid(nextPos.x, nextPos.z)) {
        this.position = nextPos;
      }
      
      // Attack if close enough
      if (distToPlayer < 1.0) {
        player.takeDamage(10 * deltaTime);
      }
    } else if (this.state === 'patrol') {
      // Patrol behavior
      this.patrolTimer += deltaTime;
      if (this.patrolTimer > 3.0) {
        this.patrolTimer = 0;
        this.patrolDirection = new Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
      }
      
      const nextPos = this.position.add(this.patrolDirection.multiply(this.speed * 0.5 * deltaTime));
      
      // Collision check
      if (level.isPositionValid(nextPos.x, nextPos.z)) {
        this.position = nextPos;
      } else {
        // Hit wall, change direction
        this.patrolDirection = new Vector3(-this.patrolDirection.x, 0, -this.patrolDirection.z);
      }
    }
  }
}

// Weapon class
class Weapon {
  constructor(type) {
    this.type = type;
    this.ammo = 30;
    this.maxAmmo = 30;
    this.damage = 25;
    this.fireRate = 0.5; // Seconds between shots
    this.lastFireTime = 0;
    this.reloading = false;
    this.reloadTime = 2.0;
    this.reloadTimer = 0;
  }
  
  canFire(currentTime) {
    return !this.reloading && 
           this.ammo > 0 && 
           (currentTime - this.lastFireTime) > this.fireRate;
  }
  
  fire(currentTime) {
    if (!this.canFire(currentTime)) return false;
    
    this.ammo--;
    this.lastFireTime = currentTime;
    return true;
  }
  
  startReload() {
    if (this.reloading || this.ammo === this.maxAmmo) return false;
    
    this.reloading = true;
    this.reloadTimer = 0;
    return true;
  }
  
  update(deltaTime) {
    if (this.reloading) {
      this.reloadTimer += deltaTime;
      if (this.reloadTimer >= this.reloadTime) {
        this.reloading = false;
        this.ammo = this.maxAmmo;
      }
    }
  }
}

// Player class
class Player {
  constructor() {
    this.position = new Vector3(1.5, 0.5, 1.5);
    this.rotation = new Vector2(0, 0); // X (pitch), Y (yaw)
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 2.0;
    this.weapon = new Weapon('rifle');
    this.isMoving = false;
    this.bobAmount = 0;
    this.bobSpeed = 10;
  }
  
  update(deltaTime, controller, level) {
    // Weapon update
    this.weapon.update(deltaTime);
    
    // Handle rotation (mouse/touch look)
    const lookDelta = controller.getLookDelta();
    this.rotation.y += lookDelta.x * 0.003;
    this.rotation.x = Math.max(-Math.PI/2.5, Math.min(Math.PI/2.5, this.rotation.x - lookDelta.y * 0.003));
    
    // Calculate forward and right vectors from rotation
    const forward = new Vector3(
      Math.sin(this.rotation.y),
      0,
      Math.cos(this.rotation.y)
    );
    
    const right = new Vector3(
      Math.sin(this.rotation.y + Math.PI/2),
      0,
      Math.cos(this.rotation.y + Math.PI/2)
    );
    
    // Handle movement
    let moveDir = new Vector3(0, 0, 0);
    this.isMoving = false;
    
    if (controller.isUpPressed()) {
      moveDir = moveDir.add(forward);
      this.isMoving = true;
    }
    
    if (controller.isDownPressed()) {
      moveDir = moveDir.add(forward.multiply(-1));
      this.isMoving = true;
    }
    
    if (controller.isLeftPressed()) {
      moveDir = moveDir.add(right.multiply(-1));
      this.isMoving = true;
    }
    
    if (controller.isRightPressed()) {
      moveDir = moveDir.add(right);
      this.isMoving = true;
    }
    
    // Normalize movement direction and apply speed
    if (moveDir.magnitude() > 0) {
      moveDir = moveDir.normalize().multiply(this.speed * deltaTime);
      
      // Movement is attempted separately in X and Z to allow sliding along walls
      let newPos = this.position.add(new Vector3(moveDir.x, 0, 0));
      if (level.isPositionValid(newPos.x, newPos.z)) {
        this.position = newPos;
      }
      
      newPos = this.position.add(new Vector3(0, 0, moveDir.z));
      if (level.isPositionValid(newPos.x, newPos.z)) {
        this.position = newPos;
      }
    }
    
    // Handle weapon firing
    if (controller.isShootPressed()) {
      if (this.weapon.fire(performance.now() / 1000)) {
        // Check for enemy hits
        const rayInfo = level.castRay(
          this.position, 
          new Vector3(
            Math.sin(this.rotation.y) * Math.cos(this.rotation.x),
            Math.sin(this.rotation.x),
            Math.cos(this.rotation.y) * Math.cos(this.rotation.x)
          ), 
          20
        );
        
        if (!rayInfo.hit) {
          // Check for entity hits
          for (const entity of level.entities) {
            if (entity instanceof Enemy) {
              const toEntity = entity.position.subtract(this.position);
              const distance = toEntity.magnitude();
              
              if (distance < 10) {
                const dot = forward.dot(toEntity.normalize());
                if (dot > 0.9) { // Within ~25 degrees of center
                  entity.takeDamage(this.weapon.damage);
                  break;
                }
              }
            }
          }
        }
      }
    }
    
    // Handle weapon reload
    if (controller.keys['KeyR']) {
      this.weapon.startReload();
    }
    
    // Update view bobbing
    if (this.isMoving) {
      this.bobAmount += deltaTime * this.bobSpeed;
    } else {
      // Return to neutral position
      this.bobAmount = Math.max(0, this.bobAmount - deltaTime * this.bobSpeed);
    }
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.health <= 0;
  }
}

// Main game renderer
class Renderer {
  constructor(canvas, resources) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resources = resources;
    this.fov = 60 * Math.PI / 180;
    this.zNear = 0.1;
    this.zFar = 100;
    
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.aspectRatio = this.canvas.width / this.canvas.height;
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  renderScene(player, level) {
    this.clear();
    
    // Draw sky and floor
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
    
    this.ctx.fillStyle = '#8B4513'; // Brown
    this.ctx.fillRect(0, this.canvas.height / 2, this.canvas.width, this.canvas.height / 2);
    
    // Calculate view bobbing
    const bobY = Math.sin(player.bobAmount * 2) * 5;
    const bobX = Math.cos(player.bobAmount) * 3;
    
    // Ray casting
    const numRays = this.canvas.width;
    for (let x = 0; x < numRays; x++) {
      // Calculate ray direction
      const cameraX = 2 * x / numRays - 1;
      const rayDirX = Math.sin(player.rotation.y) + Math.cos(player.rotation.y) * cameraX * 0.66;
      const rayDirY = Math.sin(player.rotation.x);
      const rayDirZ = Math.cos(player.rotation.y) - Math.sin(player.rotation.y) * cameraX * 0.66;
      
      const rayDir = new Vector3(rayDirX, rayDirY, rayDirZ).normalize();
      
      // Cast ray
      const rayInfo = level.castRay(player.position, rayDir, 20);
      
      if (rayInfo.hit) {
        // Calculate wall height
        let lineHeight = this.canvas.height / rayInfo.distance;
        
        // Apply fisheye correction
        lineHeight *= Math.cos(Math.atan2(cameraX, 1));
        
        // Apply view bobbing
        const drawStart = Math.max(0, -lineHeight / 2 + this.canvas.height / 2 + bobY);
        const drawEnd = Math.min(this.canvas.height, lineHeight / 2 + this.canvas.height / 2 + bobY);
        
        // Choose color based on wall orientation
        let brightness = 1.0;
        if (rayInfo.side === 1) {
          brightness = 0.7; // Darker for north/south walls
        }
        
        // Draw wall slice
        this.ctx.fillStyle = `rgb(${120 * brightness}, ${80 * brightness}, ${40 * brightness})`;
        this.ctx.fillRect(x + bobX, drawStart, 1, drawEnd - drawStart);
      }
    }
    
    // Render enemies
    for (const entity of level.entities) {
      if (entity instanceof Enemy) {
        this.renderEnemy(player, entity);
      }
    }
    
    // Render weapon
    this.renderWeapon(player);
    
    // Render UI
    this.renderUI(player);
  }
  
  renderEnemy(player, enemy) {
    // Calculate direction to enemy
    const toEnemy = enemy.position.subtract(player.position);
    const distToEnemy = toEnemy.magnitude();
    
    // Skip if too far or behind player
    if (distToEnemy > 20) return;
    
    // Calculate angle to enemy relative to player's view
    const forward = new Vector3(
      Math.sin(player.rotation.y),
      0,
      Math.cos(player.rotation.y)
    );
    
    const dot = forward.dot(toEnemy.normalize());
    
    // Skip if not in field of view
    if (dot < 0.5) return; // About 60 degrees from center
    
    // Convert 3D position to screen position
    const angle = Math.atan2(toEnemy.x, toEnemy.z) - player.rotation.y;
    const screenX = (angle / (this.fov / 2)) * (this.canvas.width / 2) + this.canvas.width / 2;
    
    // Size based on distance (perspective)
    const size = this.canvas.height / distToEnemy * 0.5;
    
    // Vertical position based on entity height and player view
    const screenY = this.canvas.height / 2 - size / 2 - 
                    ((enemy.position.y - player.position.y) / distToEnemy) * this.canvas.height;
    
    // Draw enemy sprite
    if (this.resources.getTexture('enemy')) {
      this.ctx.drawImage(
        this.resources.getTexture('enemy'),
        screenX - size / 2,
        screenY - size,
        size,
        size * 2
      );
    } else {
      // Fallback if texture isn't loaded
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(screenX - size / 2, screenY - size, size, size * 2);
    }
  }
  
  renderWeapon(player) {
    // Get weapon texture
    const weaponTexture = this.resources.getTexture('weapon');
    if (!weaponTexture) return;
    
    // Calculate weapon position with bobbing effect
    const bobX = Math.cos(player.bobAmount) * 5;
    const bobY = Math.sin(player.bobAmount * 2) * 5;
    
    // Draw weapon
    const weaponScale = this.canvas.height * 0.4;
    const weaponX = this.canvas.width / 2 - weaponScale / 2 + bobX;
    const weaponY = this.canvas.height - weaponScale + 20 + bobY;
    
    this.ctx.drawImage(
      weaponTexture,
      weaponX,
      weaponY,
      weaponScale,
      weaponScale
    );
    
    // Add muzzle flash if recently fired
    const now = performance.now() / 1000;
    if (now - player.weapon.lastFireTime < 0.1) {
      this.ctx.fillStyle = 'rgba(255, 200, 50, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(
        weaponX + weaponScale * 0.7,
        weaponY + weaponScale * 0.2,
        weaponScale * 0.1,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }
  
  renderUI(player) {
    // Draw health bar
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(20, this.canvas.height - 50, 200, 20);
    
    const healthPercent = player.health / player.maxHealth;
    this.ctx.fillStyle = healthPercent > 0.5 ? 'green' : healthPercent > 0.2 ? 'orange' : 'red';
    this.ctx.fillRect(20, this.canvas.height - 50, 200 * healthPercent, 20);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`Health: ${Math.floor(player.health)}`, 25, this.canvas.height - 35);
    
    // Draw ammo counter
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(this.canvas.width - 120, this.canvas.height - 50, 100, 20);
    
    this.ctx.fillStyle = player.weapon.reloading ? 'orange' : 'white';
    this.ctx.fillText(
      player.weapon.reloading ? 'RELOADING...' : `Ammo: ${player.weapon.ammo}/${player.weapon.maxAmmo}`,
      this.canvas.width - 115,
      this.canvas.height - 35
    );
    
    // Draw crosshair
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.canvas.width / 2 - 10, this.canvas.height / 2);
    this.ctx.lineTo(this.canvas.width / 2 - 5, this.canvas.height / 2);
    this.ctx.moveTo(this.canvas.width / 2 + 5, this.canvas.height / 2);
    this.ctx.lineTo(this.canvas.width / 2 + 10, this.canvas.height / 2);
    this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2 - 10);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height / 2 - 5);
    this.ctx.moveTo(this.canvas.width / 2, this.canvas.height / 2 + 5);
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height / 2 + 10);
    this.ctx.stroke();
  }
}

// Game class - main entry point
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.loadingScreen = document.getElementById('loading');
    
    // Check if canvas exists
    if (!this.canvas) {
      console.error('Game canvas not found!');
      return;
    }
    
    // Setup resources and renderer
    this.resources = new ResourceManager();
    this.renderer = new Renderer(this.canvas, this.resources);
    
    // Input controller
    this.controller = new GameController();
    
    // Bind click event to request pointer lock
    this.canvas.addEventListener('click', () => {
      this.controller.requestPointerLock(this.canvas);
    });
    
    // Game entities
    this.player = new Player();
    this.level = new Level();
    
    // Game state
    this.lastFrameTime = 0;
    this.isRunning = false;
    this.gameOver = false;
    
    // Start loading resources
    this.init();
  }
  
  async init() {
    try {
      // Load all resources
      await this.resources.loadAllResources();
      
      // Hide loading screen
      if (this.loadingScreen) {
        this.loadingScreen.style.display = 'none';
      }
      
      // Start game loop
      this.isRunning = true;
      this.gameLoop(0);
      
      console.log('Game initialized successfully');
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }
  
  gameLoop(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time (in seconds)
    const deltaTime = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    
    // Skip large time gaps (e.g., when tab is inactive)
    if (deltaTime > 0.1) {
      requestAnimationFrame((ts) => this.gameLoop(ts));
      return;
    }
    
    // Check game over condition
    if (this.player.health <= 0) {
      if (!this.gameOver) {
        this.gameOver = true;
        this.showGameOver();
      }
    } else {
      // Update game state
      this.update(deltaTime);
      
      // Render current frame
      this.renderer.renderScene(this.player, this.level);
    }
    
    // Schedule next frame
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  update(deltaTime) {
    // Update player
    this.player.update(deltaTime, this.controller, this.level);
    
    // Update level and entities
    this.level.update(deltaTime, this.player);
  }
  
  showGameOver() {
    // Create game over overlay
    const gameOver = document.createElement('div');
    gameOver.style.position = 'absolute';
    gameOver.style.top = '0';
    gameOver.style.left = '0';
    gameOver.style.width = '100%';
    gameOver.style.height = '100%';
    gameOver.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    gameOver.style.color = 'red';
    gameOver.style.display = 'flex';
    gameOver.style.flexDirection = 'column';
    gameOver.style.justifyContent = 'center';
    gameOver.style.alignItems = 'center';
    gameOver.style.zIndex = '1000';
    gameOver.style.fontFamily = 'Arial, sans-serif';
    
    const title = document.createElement('h1');
    title.textContent = 'GAME OVER';
    title.style.fontSize = '48px';
    title.style.marginBottom = '20px';
    
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '20px';
    restartButton.style.backgroundColor = '#333';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.borderRadius = '5px';
    restartButton.style.cursor = 'pointer';
    
    restartButton.addEventListener('click', () => {
      document.body.removeChild(gameOver);
      this.resetGame();
    });
    
    gameOver.appendChild(title);
    gameOver.appendChild(restartButton);
    document.body.appendChild(gameOver);
  }
  
  resetGame() {
    // Reset game state
    this.player = new Player();
    this.level = new Level();
    this.gameOver = false;
    this.isRunning = true;
  }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create mobile controls if they don't exist
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    createMobileControls();
  }
  
  // Start the game
  window.game = new Game();
});

// Helper function to create mobile control buttons
function createMobileControls() {
  // Check if controls already exist
  if (document.getElementById('mobileControls')) return;
  
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'mobileControls';
  controlsContainer.style.position = 'absolute';
  controlsContainer.style.bottom = '20px';
  controlsContainer.style.left = '20px';
  controlsContainer.style.zIndex = '100';
  controlsContainer.style.userSelect = 'none';
  
  // Movement controls
  const dpad = document.createElement('div');
  dpad.style.position = 'absolute';
  dpad.style.bottom = '120px';
  dpad.style.left = '10px';
  dpad.style.width = '150px';
  dpad.style.height = '150px';
  
  // Up button
  const moveUp = document.createElement('div');
  moveUp.id = 'moveUp';
  moveUp.textContent = '▲';
  moveUp.style.position = 'absolute';
  moveUp.style.top = '0';
  moveUp.style.left = '50px';
  moveUp.style.width = '50px';
  moveUp.style.height = '50px';
  moveUp.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  moveUp.style.borderRadius = '25px';
  moveUp.style.textAlign = 'center';
  moveUp.style.lineHeight = '50px';
  moveUp.style.fontSize = '24px';
  moveUp.style.color = 'white';
  
  // Down button
  const moveDown = document.createElement('div');
  moveDown.id = 'moveDown';
  moveDown.textContent = '▼';
  moveDown.style.position = 'absolute';
  moveDown.style.bottom = '0';
  moveDown.style.left = '50px';
  moveDown.style.width = '50px';
  moveDown.style.height = '50px';
  moveDown.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  moveDown.style.borderRadius = '25px';
  moveDown.style.textAlign = 'center';
  moveDown.style.lineHeight = '50px';
  moveDown.style.fontSize = '24px';
  moveDown.style.color = 'white';
  
  // Left button
  const moveLeft = document.createElement('div');
  moveLeft.id = 'moveLeft';
  moveLeft.textContent = '◀';
  moveLeft.style.position = 'absolute';
  moveLeft.style.top = '50px';
  moveLeft.style.left = '0';
  moveLeft.style.width = '50px';
  moveLeft.style.height = '50px';
  moveLeft.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  moveLeft.style.borderRadius = '25px';
  moveLeft.style.textAlign = 'center';
  moveLeft.style.lineHeight = '50px';
  moveLeft.style.fontSize = '24px';
  moveLeft.style.color = 'white';
  
  // Right button
  const moveRight = document.createElement('div');
  moveRight.id = 'moveRight';
  moveRight.textContent = '▶';
  moveRight.style.position = 'absolute';
  moveRight.style.top = '50px';
  moveRight.style.right = '0';
  moveRight.style.width = '50px';
  moveRight.style.height = '50px';
  moveRight.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
  moveRight.style.borderRadius = '25px';
  moveRight.style.textAlign = 'center';
  moveRight.style.lineHeight = '50px';
  moveRight.style.fontSize = '24px';
  moveRight.style.color = 'white';
  
  // Action buttons container
  const actionButtons = document.createElement('div');
  actionButtons.style.position = 'absolute';
  actionButtons.style.bottom = '20px';
  actionButtons.style.right = '20px';
  
  // Shoot button
  const shootButton = document.createElement('div');
  shootButton.id = 'shootButton';
  shootButton.textContent = '🔫';
  shootButton.style.width = '70px';
  shootButton.style.height = '70px';
  shootButton.style.backgroundColor = 'rgba(255, 0, 0, 0.4)';
  shootButton.style.borderRadius = '35px';
  shootButton.style.textAlign = 'center';
  shootButton.style.lineHeight = '70px';
  shootButton.style.fontSize = '30px';
  shootButton.style.marginBottom = '10px';
  
  // Jump button
  const jumpButton = document.createElement('div');
  jumpButton.id = 'jumpButton';
  jumpButton.textContent = '↑';
  jumpButton.style.width = '70px';
  jumpButton.style.height = '70px';
  jumpButton.style.backgroundColor = 'rgba(0, 255, 0, 0.4)';
  jumpButton.style.borderRadius = '35px';
  jumpButton.style.textAlign = 'center';
  jumpButton.style.lineHeight = '70px';
  jumpButton.style.fontSize = '30px';
  
  // Assemble controls
  dpad.appendChild(moveUp);
  dpad.appendChild(moveDown);
  dpad.appendChild(moveLeft);
  dpad.appendChild(moveRight);
  
  actionButtons.appendChild(shootButton);
  actionButtons.appendChild(jumpButton);
  
  controlsContainer.appendChild(dpad);
  document.body.appendChild(controlsContainer);
  document.body.appendChild(actionButtons);
  
  // Prevent default touch behavior to avoid zooming and scrolling
  document.addEventListener('touchmove', (e) => {
    if (e.target.id === 'gameCanvas' || 
        e.target.closest('#mobileControls') || 
        e.target.closest('#actionButtons')) {
      e.preventDefault();
    }
  }, { passive: false });
}
