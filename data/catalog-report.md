# Reporte de conversion del catalogo

Origen: `CATALOGO_marcas_separadas.xlsx`
Generado: 2026-09-04T10:27:12

## Totales

- Filas en el excel: **1831**
- Productos publicados: **1828**
- Filas descartadas sin codigo: **3**
- Familias: **28**  |  Marcas: **41**
- Productos con imagen: **1630** (89%)
- Productos sin imagen: **198**
- Productos sin subfamilia: **720**
- URLs de imagen: **2625**
- Productos con referencias cruzadas: **90**

## Referencias cruzadas

La columna CODIGO mezcla dos cosas: el codigo de la pieza y, en 90 filas, una lista de equivalencias OEM separadas por barra.
El conversor toma la primera referencia como codigo principal y guarda el
resto como referencias cruzadas, que siguen siendo buscables y se muestran
en la ficha del producto.

| Codigo principal | Referencias | Valor original |
| --- | --- | --- |
| 21042154 | 23 | `Volvo: 21042154 / Volvo: 21342245/ Volvo: 21625908/ Volvo: 22250859 / Volvo: 22251164 / Volvo: 22498408/ Volvo: 22499250` |
| 85106370 | 7 | `VOLVO 85106370/FREIGHTLINER DNP527682/ CATERPILLAR 3I1456/ DONALDSON P527682/ GILLIG 8210791000/ DONSSON DA2524/ FORD 95` |
| 20367004 | 7 | `VOLVO: 20367004 / DIESEL TECNIC: 2.62612 / SAMPA: 095.249 / PETERS ENNEPETAL: 143.192-00A / S-TR: STR-30701 / CEI: 225.1` |
| 6.61035 | 7 | `DIESEL TECNIC: 6.61035 / FEBI BILSTEIN: 101732 / JURID: 569256J / AUGER: 31457 / FERODO: FCR374A / CEI: 215.200 / PETERS` |
| 40020234 | 6 | `40020234/ Gunite SA00201 / Gunite SA00502/ AUTOMANN 135.2830 / Bendix 065173/ Bendix 065562` |
| 1789567 | 6 | `SCANIA: 1789567/ SLP:BSA-567/ DIESEL TECNIC: 1.18630/ PETERS ENNEPETAL: 126.310-50A/ SAMPA 042.406/ FEBI BILSTEIN 31598` |
| 1789568 | 6 | `SCANIA: 1789568/ SLP: BSA-568/ DIESEL TECNIC :1.18631/ FEBI BILSTEIN: 31599/ SAMPA: 042.405 / PETERS ENNEPETAL: 126.311-` |
| 2191P185114 | 6 | `MACK : 2191P185114/ MACK: 25100042/ MACK :2MD515M/ MACK : 57MD320M/ VOLVO: 85114043/ DONALDSON: DBA5114` |
| 40010140 | 5 | `40010140/ Eaton 506272/ Volvo 24424217 / Volvo 3946256 / Mack 25QD259P4` |
| 40020231 | 5 | `40020231/ Fleetrite FLTAS1140/ Haldex 400-20231/ Haldex 409-20019/ Spicer K133527"` |
| 1789564 | 5 | `SCANIA: 1789564 / AUGER 58034/ FEBI BILSTEIN 179210/ DIESEL TECNIC : 1.18637/ SAMPA 042.399` |
| 1789562 | 5 | `SCANIA: 1789562/ DIESEL TECNIC: 1.18634/ SAMPA: 042.394/ FEBI BILSTEIN 31593/ PETERS ENNEPETAL: 126.302-50A` |
| 6774686 | 5 | `VOLVO: 6774686/ DIESEL TECNIC: 2.40341/ FEBI BILSTEIN: 24459/ AUGER: 31406/ PETERS ENNEPETAL: 146.200-00A` |
| DNP552518 | 5 | `DNP552518 / AC DELCO: PF20 / AGCO: 72217092/ ALCO: SP888/ AC DELCO: PF20` |
| 21196275 | 5 | `VOLVO: 21196275/ AUGER: 77424/ DIESEL TECNIC: 2.96064/ S-TR: STR-130742/ LEMA: 1155.17` |
| 2.70119 | 5 | `DT Spare Parts: 2.70119/ AUGER: 68469/ TRUCKTEC AUTOMOTIVE: 03.44.035/ SIEGEL AUTOMOTIVE: SA2C0025/ FEBI BILSTEIN: 39490` |
| 82196750 | 5 | `VOLVO: 82196750/ DIESEL TECNIC: 6.61022/ VOLVO : 82196750/ FEBI BILSTEIN: 18019/ AUGER: 31451` |
| AS1172 | 4 | `AS1172/ Volvo :20527307/ Mack Trucks: 25QD419P2/ Bendix: KO41771` |
| AS1173 | 4 | `AS1173 / VOLVO: 20714924 / Freightliner: GUN AS1173/ Bendix Corporation: KO41769` |
| 40020241 | 4 | `40020241 / Bendix 65183/ Bendix 65563/ Gunite AS1040` |
| R803112 | 4 | `R803112/ MACK: 8235R803112/ ROCKWELL: R801074B40/ WORLD AMERICAN: WAR801074` |
| 21739593 | 4 | `VOLVO: 21739593/ DT Spare Parts: 2.61278/ AUGER: 20528/ SLP: CSA-593` |
| 1789561 | 4 | `SCANIA: 1789561/ DIESEL TECNIC: 1.18627/ FEBI BILSTEIN 31592/ PETERS ENNEPETAL: 126.301-50A` |
| DNP556916 AC | 4 | `DNP556916 AC / DELCO : PF902 / AGCO: 029463 / ALCO: SP885` |
| 1833121C1 | 4 | `1833121C1 / AC DELCO: PF2144 / AGCO: 72516519 / AMERICAN PARTS: 92799` |

## Marcas normalizadas

| Correccion | Filas |
| --- | --- |
| MERCEDES -> MERCEDES BENZ | 5 |
| CAT -> CATERPILLAR | 3 |
| MBB -> MERCEDES BENZ | 1 |
| VOVLO -> VOLVO | 1 |
| MERCEDEZ BENZ -> MERCEDES BENZ | 1 |
| FLETTGUARD -> FLEETGUARD | 1 |
| MWB -> MERCEDES BENZ | 1 |
| MB -> MERCEDES BENZ | 1 |
| MERCEBES BENZ -> MERCEDES BENZ | 1 |

## Codigos repetidos

El mismo codigo aparece en mas de una fila. Se les asigno una URL unica.

| Codigo | URL asignada |
| --- | --- |
| 8159975 | /producto/8159975-2 |
| 1578889 | /producto/1578889-2 |
| 286171 | /producto/286171-2 |
| P24 | /producto/p24-2 |
| P24 | /producto/p24-3 |
| P24 | /producto/p24-4 |
| P30 | /producto/p30-2 |
| P30 | /producto/p30-3 |
| 49027 YELLOW | /producto/49027-yellow-2 |
| 49027 BLUE | /producto/49027-blue-2 |
| 49027 RED | /producto/49027-red-2 |
| 20915096 | /producto/20915096-2 |
| 8151616 | /producto/8151616-2 |
| 20922303 | /producto/20922303-2 |
| 1R12-404 | /producto/1r12-404-2 |
| 542033410 | /producto/542033410-2 |
| 1570932 | /producto/1570932-2 |
| 4101331 | /producto/4101331-2 |
| WG9725310020 | /producto/wg9725310020-2 |
| 21083654 | /producto/21083654-2 |
| 21083657 | /producto/21083657-2 |
| 21083660 | /producto/21083660-2 |
| 20562627 | /producto/20562627-2 |

## URLs de imagen descartadas

Ninguna. Todas las URLs del excel son validas.

## Productos por familia

| Familia | Productos | Subfamilias |
| --- | --- | --- |
| MISCELLANY | 247 | 9 |
| AIR BRAKE COMPONENTS | 219 | 6 |
| FILTERS | 190 | 5 |
| SENSORS | 142 | 0 |
| SUSPENSION | 112 | 0 |
| PUMP | 104 | 4 |
| CLUTCH SYSTEM | 95 | 5 |
| SHOCK ABSORBERS | 81 | 2 |
| GEAR SHIFT VALVES AND ACCESORIES | 78 | 0 |
| OIL SEAL | 77 | 7 |
| BEARINGS | 74 | 2 |
| AIR SPRINGS | 67 | 0 |
| UNIVERSAL JOINT | 44 | 0 |
| HOSE | 33 | 0 |
| MOUNTING | 33 | 5 |
| RADIATORS AND INTERCOOLERS | 31 | 0 |
| PULLEY AND BELT TENSIONER | 30 | 0 |
| BUSHING | 25 | 0 |
| GEAR SHIFT HANDLES | 23 | 0 |
| CAB TILT PUMP AND CABIN CYLINDER | 21 | 0 |
| STARTERS AND ALTERNATORS | 19 | 0 |
| Z-CAM BRAKES | 19 | 0 |
| BRAKE PAD KIT AND BRAKE DISC | 16 | 0 |
| WHEEL BOLT - WHEEL NUT | 15 | 0 |
| WATER TANKS | 14 | 0 |
| COMPRESSOR | 10 | 0 |
| CAMSHAFT | 6 | 0 |
| REAR AXLE POSTERIOR HUB | 3 | 0 |
