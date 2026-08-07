"""Idempotent seed command porting sokoprice/src/utils/mockData.ts into
the real database, so the transition from the mock frontend preserves
familiar demo data. Safe to re-run (get_or_create keyed on the same
string IDs the mock uses)."""

import random
from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from catalog.models import PricePoint, Product
from engagement.models import Notification, PriceAlert
from vendors.models import Vendor, VendorListing

VENDORS = [
    dict(id='ms-computers', name='MS Computers & Wholesalers', initials='MS',
         category='IT hardware & peripherals',
         description='Leading IT products distributor and wholesaler. Specializes in supplying high-quality technology solutions to corporate clients and institutions.',
         location='Nairobi CBD', area='CBD', rating=Decimal('4.7'), review_count=312, badge='Verified',
         phone='+254 20 222 3344', email='sales@mscomputers.co.ke', whatsapp='+254 722 100 200',
         opening_hours='Mon–Fri 8:00–18:00, Sat 9:00–16:00', is_verified=True, color_hex='#1a3a5c',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=MS&backgroundColor=1a3a5c'),
    dict(id='gadgetronix', name='Gadgetronix Kenya Ltd', initials='GK',
         category='Computers, networking, CCTV',
         description='One-stop shop for computers, networking equipment, CCTV systems, and IT accessories. Corporate and retail.',
         location='Kilimani, Nairobi', area='Kilimani', rating=Decimal('4.5'), review_count=189, badge='Verified',
         phone='+254 20 555 7788', email='info@gadgetronix.co.ke', whatsapp='+254 733 400 500',
         opening_hours='Mon–Sat 8:30–17:30', is_verified=True, color_hex='#2d5a3d',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=GK&backgroundColor=2d5a3d'),
    dict(id='dove-computers', name='Dove Computers Kenya', initials='DC',
         category='HP authorized dealer',
         description='Authorized HP dealer in Kenya. Genuine HP products at competitive prices. Corporate procurement specialists.',
         location='Westlands, Nairobi', area='Westlands', rating=Decimal('4.8'), review_count=421, badge='Premium',
         phone='+254 20 444 5566', email='corporate@dovecomputers.co.ke', whatsapp='+254 700 800 900',
         opening_hours='Mon–Fri 8:00–17:00, Sat 9:00–13:00', is_verified=True, color_hex='#5a2d2d',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=DC&backgroundColor=5a2d2d'),
    dict(id='sai-office', name='Sai Office Supplies', initials='SO',
         category='Stationery, IT peripherals',
         description='Part of Ramco Group. Leading wholesaler and distributor of stationery, IT peripherals, and office essentials.',
         location='Westlands, Nairobi', area='Westlands', rating=Decimal('4.3'), review_count=234, badge='Trusted',
         phone='+254 20 666 7890', email='orders@saioffice.co.ke',
         opening_hours='Mon–Fri 7:30–17:30, Sat 8:00–15:00', is_verified=True, color_hex='#4a3d1a',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=SO&backgroundColor=4a3d1a'),
    dict(id='vector-digital', name='Vector Digital Kenya', initials='VD',
         category='IT products, EMEA distributor',
         description='Reliable IT products supplier within EMEA. Partners with multinational technology companies for consistent supply.',
         location='Upper Hill, Nairobi', area='Upper Hill', rating=Decimal('4.6'), review_count=156, badge='Verified',
         phone='+254 20 888 9900', email='kenya@vectordigital.com', website='https://vds.co.ke',
         opening_hours='Mon–Fri 8:00–17:00', is_verified=True, color_hex='#2d3a5a',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=VD&backgroundColor=2d3a5a'),
    dict(id='almiria', name='Almiria Solutions', initials='AL',
         category='Printers, scanners, consumables',
         description='Authorized dealer for HP, Epson, Brother, Kyocera, and Canon. Printer sales, service, and consumables supply.',
         location='Ngara, Nairobi', area='Ngara', rating=Decimal('4.4'), review_count=98, badge='New',
         phone='+254 20 333 4455', email='sales@almiria.co.ke',
         opening_hours='Mon–Fri 8:30–17:30, Sat 9:00–14:00', is_verified=False, color_hex='#3a2d5a',
         logo_url='https://api.dicebear.com/9.x/rings/png?seed=AL&backgroundColor=3a2d5a'),
]

PRODUCTS = [
    dict(id='laptop-hp-840', name='HP EliteBook 840 G8', category='IT & Computers', subcategory='Laptops',
         description='Business-grade laptop with Intel Core i5-1135G7, 16GB DDR4, 512GB NVMe SSD. Ideal for corporate procurement.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/HP_Pavilion_dv2000_laptop.jpg/960px-HP_Pavilion_dv2000_laptop.jpg',
         tags=['Core i5', '16GB RAM', '512GB SSD', 'Windows 11 Pro', '1 year warranty', 'HP'], unit='per unit', end_price=78500, volatility=0.04),
    dict(id='toner-cf230a', name='HP CF230A Toner Cartridge', category='Consumables', subcategory='Toner Cartridges',
         description='Original HP black toner cartridge for HP LaserJet Pro M203 and M227. Yields approximately 1,600 pages.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/HP_117A_-_black_laser_toner_cartridge-2407.jpg/960px-HP_117A_-_black_laser_toner_cartridge-2407.jpg',
         tags=['HP Original', 'Black', '~1,600 pages', 'CF230A', 'LaserJet Pro'], unit='per cartridge', end_price=3200, volatility=0.08),
    dict(id='cable-cat6-305m', name='CAT6 Cable (305m box)', category='Networking', subcategory='Cables',
         description='Outdoor-rated CAT6 UTP stranded cable, 305m box. Suitable for structured cabling in commercial installations.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/b/b8/UTP_Cat_6.jpg',
         tags=['CAT6', '305m', 'Outdoor rated', 'UTP', 'Stranded'], unit='per box', end_price=8900, volatility=0.03),
    dict(id='ups-apc-650va', name='APC UPS 650VA', category='Power', subcategory='UPS Systems',
         description='APC Back-UPS 650VA/360W with AVR (Automatic Voltage Regulation). Includes USB monitoring port.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/APC_Back-UPS_ES525.jpg/960px-APC_Back-UPS_ES525.jpg',
         tags=['650VA', '360W', 'AVR', 'USB monitoring', 'APC', 'BX650CI'], unit='per unit', end_price=6400, volatility=0.05),
    dict(id='switch-cisco-sg110', name='Cisco SG110-8 Switch', category='Networking', subcategory='Switches',
         description='8-port Gigabit unmanaged switch with plug-and-play setup. Ideal for small office networking.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Ethernet_switch_Atlantis_A02-F5P_5_ports_backend.jpg/960px-Ethernet_switch_Atlantis_A02-F5P_5_ports_backend.jpg',
         tags=['8-port', 'Gigabit', 'Unmanaged', 'Cisco', 'SG110-08'], unit='per unit', end_price=12400, volatility=0.04),
    dict(id='monitor-dell-p2422h', name='Dell P2422H 24" Monitor', category='IT & Computers', subcategory='Monitors',
         description='Full HD IPS display with USB-C, HDMI, and DisplayPort. Pivot and height-adjustable stand.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/4/45/LED_Screen_Computer.jpg',
         tags=['24 inch', 'FHD 1080p', 'IPS Panel', 'USB-C', 'Pivot stand', 'Dell'], unit='per unit', end_price=24800, volatility=0.03),
    dict(id='keyboard-mx-keys', name='Logitech MX Keys', category='Office Supplies', subcategory='Keyboards',
         description='Wireless backlit keyboard with multi-device support (up to 3 devices). Smart illumination.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Keyboard_Cherry_Stream_Wireless%2C_German_layout_%28c._2020%29.jpg/960px-Keyboard_Cherry_Stream_Wireless%2C_German_layout_%28c._2020%29.jpg',
         tags=['Wireless', 'Backlit', 'Multi-device', 'USB-C', 'Logitech'], unit='per unit', end_price=9200, volatility=0.02),
    dict(id='ssd-samsung-870', name='Samsung 870 EVO 1TB', category='IT & Computers', subcategory='Storage',
         description='2.5" SATA SSD with sequential read speeds up to 560 MB/s. 5-year warranty.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Samsung_980_PRO_PCIe_4.0_NVMe_SSD_1TB-top_PNr%C2%B00915.jpg/960px-Samsung_980_PRO_PCIe_4.0_NVMe_SSD_1TB-top_PNr%C2%B00915.jpg',
         tags=['1TB', '2.5" SATA', '560 MB/s', 'Samsung', '5yr warranty'], unit='per unit', end_price=11800, volatility=0.06),
    dict(id='paper-a4-80gsm', name='A4 Paper Ream (80gsm)', category='Stationery', subcategory='Paper',
         description='Premium A4 copy paper, 80gsm, 500 sheets per ream. Acid-free for long-lasting documents.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/15_reams_of_paper_stacked_on_the_floor.jpg/960px-15_reams_of_paper_stacked_on_the_floor.jpg',
         tags=['A4', '80gsm', '500 sheets', 'Acid-free'], unit='per ream', end_price=450, volatility=0.05),
    dict(id='mouse-logitech-m720', name='Logitech M720 Triathlon', category='Office Supplies', subcategory='Mice',
         description='Multi-device wireless mouse for power users. Works across up to 3 computers with Easy-Switch.',
         image_url='https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/A_wireless_computer_mouse.jpg/960px-A_wireless_computer_mouse.jpg',
         tags=['Wireless', 'Multi-device', 'Easy-Switch', 'Logitech'], unit='per unit', end_price=7800, volatility=0.03),
]

# vendor_id, price, in_stock, min_order_qty, contact_phone, notes
VENDOR_LISTINGS = {
    'laptop-hp-840': [
        ('dove-computers', 78500, True, 1, '+254 20 444 5566', ''),
        ('ms-computers', 80000, True, 1, None, ''),
        ('gadgetronix', 81500, True, 1, None, ''),
        ('vector-digital', 84200, False, 2, None, 'Lead time: 3 business days'),
    ],
    'toner-cf230a': [
        ('almiria', 3200, True, 1, None, ''),
        ('sai-office', 3400, True, 1, None, ''),
        ('ms-computers', 3450, True, 1, None, ''),
        ('dove-computers', 3600, True, 3, None, ''),
    ],
    'cable-cat6-305m': [
        ('gadgetronix', 8900, True, 1, None, ''),
        ('ms-computers', 9100, True, 1, None, ''),
        ('vector-digital', 9400, True, 2, None, ''),
    ],
    'ups-apc-650va': [
        ('vector-digital', 6400, True, 1, None, ''),
        ('ms-computers', 6600, True, 1, None, ''),
        ('dove-computers', 6800, True, 1, None, ''),
    ],
}


def generate_trend(end_price, days, volatility, rng):
    """Transliteration of mockData.ts's generateTrend() — a random walk
    toward end_price, seeded for reproducible demo data."""
    points = []
    price = end_price * (1 + (rng.random() * volatility * 2 - volatility))
    for i in range(days, -1, -1):
        d = date.today() - timedelta(days=i)
        price = price + (end_price - price) * 0.1 + (rng.random() - 0.5) * end_price * 0.01
        points.append((d, round(price), round(price * 0.96)))
    return points


class Command(BaseCommand):
    help = 'Seed the database with demo data ported from src/utils/mockData.ts'

    def handle(self, *args, **options):
        rng = random.Random(42)

        for v in VENDORS:
            vendor, created = Vendor.objects.update_or_create(id=v['id'], defaults=v)
            self.stdout.write(f'{"Created" if created else "Updated"} vendor {vendor.id}')

        for p in PRODUCTS:
            fields = {k: val for k, val in p.items() if k not in ('end_price', 'volatility')}
            product, created = Product.objects.update_or_create(id=p['id'], defaults=fields)
            self.stdout.write(f'{"Created" if created else "Updated"} product {product.id}')

            points = generate_trend(p['end_price'], 30, p['volatility'], rng)
            for d, avg_price, min_price in points:
                PricePoint.objects.update_or_create(
                    product=product, date=d,
                    defaults={'avg_price': avg_price, 'min_price': min_price},
                )

        for product_id, listings in VENDOR_LISTINGS.items():
            product = Product.objects.get(id=product_id)
            for vendor_id, price, in_stock, moq, contact_phone, notes in listings:
                vendor = Vendor.objects.get(id=vendor_id)
                VendorListing.objects.update_or_create(
                    vendor=vendor, product=product,
                    defaults={
                        'price': price, 'in_stock': in_stock, 'min_order_qty': moq,
                        'contact_phone': contact_phone, 'notes': notes,
                    },
                )
        self.stdout.write('Vendor listings seeded')

        admin_user, created = User.objects.get_or_create(
            email='demo@sokoprice.co.ke',
            defaults={
                'username': 'demo-admin',
                'business_name': 'Blaze Solutions Ltd',
                'phone': '+254 700 000 000',
                'location': 'Nairobi, Kenya',
                'currency': 'KES',
                'plan': 'business',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if created:
            admin_user.set_password('sokoprice-demo-2026')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(
                'Created demo admin: demo@sokoprice.co.ke / sokoprice-demo-2026'
            ))
        else:
            self.stdout.write('Demo admin already exists')

        toner = Product.objects.get(id='toner-cf230a')
        laptop = Product.objects.get(id='laptop-hp-840')
        PriceAlert.objects.get_or_create(
            user=admin_user, product=toner,
            defaults={'target_price': 3000, 'direction': 'below', 'is_active': True},
        )
        PriceAlert.objects.get_or_create(
            user=admin_user, product=laptop,
            defaults={'target_price': 75000, 'direction': 'below', 'is_active': True},
        )

        almiria = Vendor.objects.get(id='almiria')
        cable = Product.objects.get(id='cable-cat6-305m')
        now = timezone.now()
        notif_seed = [
            dict(type='price_drop', title='Price dropped — CF230A Toner',
                 body='Almiria Solutions lowered their price to KES 3,200. Down 8% from last week.',
                 product=toner, vendor=None, is_read=False, created_at=now - timedelta(minutes=20)),
            dict(type='new_vendor', title='New vendor in your area',
                 body='Almiria Solutions has joined SokoPrice and listed 29 products.',
                 product=None, vendor=almiria, is_read=False, created_at=now - timedelta(hours=2)),
            dict(type='price_drop', title='CAT6 Cable price dipped',
                 body='Gadgetronix Kenya: KES 8,900 per box — 3.2% lower than yesterday.',
                 product=cable, vendor=None, is_read=True, created_at=now - timedelta(hours=5)),
        ]
        for n in notif_seed:
            Notification.objects.get_or_create(
                user=admin_user, title=n['title'],
                defaults={k: v for k, v in n.items() if k != 'title'} | {'user': admin_user},
            )

        self.stdout.write(self.style.SUCCESS('Seed complete.'))
