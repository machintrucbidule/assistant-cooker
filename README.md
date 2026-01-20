# Assistant Cooker

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

A Home Assistant custom integration for intelligent cooking monitoring with temperature probes.

## Features

- 🌡️ **Real-time Monitoring** - Track probe and ambient temperatures
- ⏱️ **Time Estimation** - Automatic remaining time calculation based on heating rate
- 🎯 **Food Database** - Preset temperatures for beef, pork, poultry, lamb, fish, and more
- 🔥 **Thermal Compensation** - Calculate optimal withdrawal temperature accounting for carryover cooking
- 📊 **Historical Graph** - Visualize temperature curves over time
- 🌍 **Multi-language** - 21 languages supported

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Click the 3-dot menu → Custom repositories
3. Add `https://github.com/your-repo/assistant-cooker` as "Integration"
4. Search for "Assistant Cooker" and install
5. Restart Home Assistant

### Manual Installation

1. Download the latest release
2. Copy `custom_components/assistant_cooker` to your `config/custom_components/` folder
3. Restart Home Assistant

## Configuration

### Adding the Integration

1. Go to Settings → Devices & Services
2. Click "+ Add Integration"
3. Search for "Assistant Cooker"
4. Follow the configuration wizard

### Adding the Card

1. Edit a dashboard
2. Add a card → Search "Assistant Cooker"
3. Configure options:

```yaml
type: custom:assistant-cooker-card
entity_prefix: assistantcooker
show_battery: true
show_rssi: true
show_graph: true
show_ambient: true
show_rate: true
```

## Usage

### Card States

| State | Description |
|-------|-------------|
| **Disconnected** | Probe not detected |
| **Ready** | Probe connected, ready to start |
| **Cooking** | Cooking in progress |
| **Done** | Target temperature reached |

### Selecting Food

1. Choose a category (Beef, Pork, etc.)
2. Choose the food (Steak, Roast, etc.)
3. Choose doneness level (Rare, Medium, etc.)

Target temperature is automatically configured.

### Manual Mode

Select "🎯 Manual" to set a custom target temperature.

### Thermal Compensation

When enabled, the card calculates the optimal withdrawal temperature accounting for carryover cooking (temperature continues rising after removing from heat).

## Created Entities

| Entity | Description |
|--------|-------------|
| `sensor.{prefix}_state` | Cooking state |
| `sensor.{prefix}_probe_temperature` | Probe temperature |
| `sensor.{prefix}_ambient_temperature` | Ambient temperature |
| `sensor.{prefix}_target_temperature` | Target temperature |
| `sensor.{prefix}_remaining_time` | Remaining time (minutes) |
| `sensor.{prefix}_progress` | Progress (%) |
| `sensor.{prefix}_heating_rate` | Heating rate (°C/min) |
| `sensor.{prefix}_battery` | Battery level |
| `sensor.{prefix}_signal_strength` | Signal strength |

## Services

| Service | Description |
|---------|-------------|
| `assistant_cooker.start_cooking` | Start cooking session |
| `assistant_cooker.stop_cooking` | Stop/reset cooking session |
| `assistant_cooker.set_food` | Select food preset |
| `assistant_cooker.set_target_temp` | Set manual target temperature |
| `assistant_cooker.set_carryover` | Enable/disable thermal compensation |

## Compatibility

- **Home Assistant**: 2024.1.0+
- **Supported Probes**: Meater (via Meater integration)

## Contributing

Contributions welcome! See [AI_DEVELOPMENT_GUIDE.md](AI_DEVELOPMENT_GUIDE.md) for technical details.

## License

MIT License - see [LICENSE](LICENSE)
