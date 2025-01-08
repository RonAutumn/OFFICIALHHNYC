# Instructions

> **⚠️ IMPORTANT: Always check CHANGELOG.md first**
> - Review project structure in CHANGELOG.md
> - Follow implementation history for context
> - Check existing components before creating new ones
> - Verify dependencies and configurations

## Visual UI Components

### Product Grid
- Responsive grid layout with 1-4 columns based on screen size
- Product cards with consistent height and width
- Image optimization with proper aspect ratios
- Loading skeleton states for smooth UX
- Hover effects and transitions

### Product Card
- Clean, minimal design with clear hierarchy
- Product image with optimized loading
- Title, price, and variation selector
- Add to cart button with loading state
- Toast notifications for user feedback

### Categories Panel
- Sidebar layout with smooth transitions
- Active state indicators
- Clear typography hierarchy
- Loading states for category list
- Mobile-responsive design

### Cart UI
- Persistent cart icon in header
- Real-time item count badge
- Smooth animations for updates
- Clear total and item list
- Easy access to checkout

### Checkout Form
- Multi-step form with clear progress
- Responsive input fields
- Delivery/shipping option selector
- Calendar component for delivery date
- Order summary with fee calculation
- Form validation feedback

### Theme and Styling
- Consistent color scheme using CSS variables
- Responsive typography scale
- Proper spacing and alignment
- Interactive states (hover, focus, active)
- Accessible contrast ratios

### Loading States
- Skeleton loaders for content
- Smooth transitions
- Progress indicators
- Error state handling
- Empty state designs

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Touch-friendly interactions
- Proper spacing on all devices
- Optimized images for different screens

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support

### Error Handling
- User-friendly error messages
- Toast notifications
- Form validation feedback
- Loading state indicators
- Recovery suggestions

Do not delete or edit this file.
do not delete or edit any files in the directory not related to task 
Check Codebase before creating or deleting anything.

1.consolidate project and remove redundant files not related to nextjs project. 'completed'
2. clean up back end redundant codes and files. 'completed'
3. we need to fetch category data from airtable 'completed'
4. we need to fetch product data from airtable 'completed'
5. we need to fetch order data from airtable 'completed'
6. apply categories with shadcn side panel to home page 'completed'
7. apply products with shadcn card to home page 'in progress'
   - Install required dependencies (class-variance-authority) 'completed'
   - Create product card component 'completed'
   - Implement grid layout for products 'completed'
   
8. remove duplicated categories. only display active categories 'completed'
    -add proper dropdown on products with variations 'pending'
    -remove number from categoies 'completed'
    -add cart icon 'completed
    -ensure add to cart functionality is working 'completed'

9. add checkout page 'completed'
    -apply calendar to delivery form 'completed'
    -fetch deliveries from settings table from airtable 'completed'
     -add shipping form to checkout page 'completed'

10. add order summary to confirmation page 'completed'
    -ensure orders are being saved in a json file before being sent to airtable and accept orders in any format sent to backend 'completed'
    -add payment link and email will be sent to customer 'completed'
    -ensure order details are displayed in confirmation page 'completed'
    -ensure shipping orders can be placed 'completed'
    
11. Create ui for admin page with shadcn theme and side panels 'completed'
    -import oders from json file into oders tab in admin page 'completed'
    -fix duplicate in ui 'completed'
    -Sorting functionality 'pending'
    -Filtering by date/status 'completed'
    -Search functionality 'completed'
    -Detailed order view 'pending'
    -Export functionality 'pending'
    -Pagination 'pending'
    -Order details view 'complete'
    -Status management 'complete'

12.  -merge store managemnt and products into one tab 'completed'
    - import products data from airtable into products tab in admin page 'completed'
    -import categories data from airtable into categories in store tab 'completed'
    -ensure products active/inactive status is being fetched from airtable and match admin 'completed'
    front end display both data from json file synced from airtable 'completed'
    -add product functionality to add/edit/delete/out of stock products 'pending'
    -implement fetch and sync for products 'completed'
    -implement fetch and sync for categories 'completed'
   -add category functionality to add/edit/delete categories 'pending'
    -add product image functionality to add/edit/delete product images 'pending'
    -add product variation functionality to add/edit/delete product variations 'completed'
    -add product variation image functionality to add/edit/delete product variation images 'completed'
     - add "Specials/deals" product creation feature. can import active products into a special/deals 'completed'
     -create bundle category 'completed'

     13. ensure products are being fetched from json file instead of airtable 'completed'
         -ensure images are being displayed in product card 'completed'
         -DROPDOWN FOR VARIATION SELECTION 'completed'
         -REMOVCE STATEN ISLAND AND BRONX FROM DELIVERY OPTIONS 'completed'
         -block out manhttan delivery options. only allow tuesday and fridays
         -categories tab in frontend is functioal 'completed'  
         -add bundles category 'completed'
         -create json file for bundles created in admin page 'completed'

         14. add password protection to frontend 'completed'    
            -add password protection management to admin page settings tab 'completed'


15. GET READY FOR DEPLOYMENT
-fix cart icon functionality and ensure it is working and smooth 'pending'
-send admin email to admin when order is placed 'completed'  
   -clean up code for deployment 'completed'
   -optimize for mobile 'pending'
DEPLOY TO NETLIFY vercel 'completed'

      POST DEPLOYMENT

- ensure delivery settings are being fetched from airtable 'pending'
-ensure side panels are implemented in mobile view 'pending'



