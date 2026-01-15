const Booking = require('../models/Booking');
const Hostel = require('../models/Hostel');
const RentPayment = require('../models/RentPayment');
const Complaint = require('../models/Complaint');
const Wishlist = require('../models/Wishlist');

// @desc    Get student dashboard
// @route   GET /student_dashboard
exports.getStudentDashboard = async (req, res) => {
    try {
        const uid = req.session.user.id;

        // Get bookings
        const bookings = await Booking.find({ student: uid })
            .populate('hostel', 'name price announcement_text owner')
            .populate('room', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Get complaints
        const complaints = await Complaint.find({ student: uid })
            .populate('hostel', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Get wishlist
        const wishlist = await Wishlist.find({ student: uid })
            .populate('hostel')
            .lean();

        // Get rent payments
        const payments = await RentPayment.find({ student: uid })
            .sort({ _id: -1 })
            .lean();

        // Find active booking
        let activeBooking = bookings.find(b => b.status === 'Approved');
        let stayRecord = null;

        if (activeBooking) {
            const joinDate = new Date(activeBooking.createdAt);
            const today = new Date();

            let monthsPassed = (today.getFullYear() - joinDate.getFullYear()) * 12 +
                (today.getMonth() - joinDate.getMonth());
            if (today.getDate() < joinDate.getDate()) monthsPassed--;

            let cycleStart = new Date(joinDate);
            cycleStart.setMonth(joinDate.getMonth() + monthsPassed);
            let cycleEnd = new Date(cycleStart);
            cycleEnd.setMonth(cycleStart.getMonth() + 1);

            const dateRangeStr = `${cycleStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${cycleEnd.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;

            // Check/Create rent payment bill
            const existingBill = await RentPayment.findOne({
                booking: activeBooking._id,
                month_year: dateRangeStr
            });

            if (!existingBill) {
                await RentPayment.create({
                    student: uid,
                    booking: activeBooking._id,
                    month_year: dateRangeStr,
                    amount: activeBooking.final_rent,
                    status: 'Pending'
                });
            }

            // Calculate stay record
            stayRecord = {
                joinDate: joinDate.toLocaleDateString(),
                nextDue: cycleEnd.toLocaleDateString(),
                amount: activeBooking.final_rent,
                daysStayed: Math.ceil(Math.abs(today - joinDate) / (1000 * 60 * 60 * 24)),
                status: activeBooking.status,
                announcement: activeBooking.hostel.announcement_text,
                owner_id: activeBooking.hostel.owner,
                hostel_name: activeBooking.hostel.name,
                hostel_id: activeBooking.hostel._id
            };
        }

        res.render('student_dashboard', {
            user: req.session.user,
            bookings,
            complaints,
            wishlist: wishlist.map(w => w.hostel),
            payments,
            stay: stayRecord,
            activeBooking
        });
    } catch (error) {
        console.error('Student Dashboard Error:', error);
        res.status(500).send('Error loading dashboard');
    }
};
