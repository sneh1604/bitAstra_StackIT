const Report = require('../models/Report.model');
const Question = require('../models/Question.model');
const Answer = require('../models/Answer.model');
const User = require('../models/User.model');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../services/notification.service');

// @desc    Create a report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res, next) => {
    try {
        const { reportedItem, itemType, reason } = req.body;

        // Validate item exists
        let item;
        if (itemType === 'question') {
            item = await Question.findById(reportedItem);
        } else if (itemType === 'answer') {
            item = await Answer.findById(reportedItem);
        } else if (itemType === 'user') {
            item = await User.findById(reportedItem);
        }

        if (!item) {
            return next(new ErrorResponse('Reported item not found', 404));
        }

        // Check if user already reported this item
        const existingReport = await Report.findOne({
            reporter: req.user.id,
            reportedItem,
            itemType
        });

        if (existingReport) {
            return next(new ErrorResponse('You have already reported this item', 400));
        }

        const report = await Report.create({
            reporter: req.user.id,
            reportedItem,
            itemType,
            reason
        });

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res, next) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const reports = await Report.find(query)
            .populate('reporter', 'username avatar')
            .populate('handledBy', 'username')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Handle report
// @route   PUT /api/reports/:id/handle
// @access  Private/Admin
exports.handleReport = async (req, res, next) => {
    try {
        const { actionTaken } = req.body;
        const report = await Report.findById(req.params.id);

        if (!report) {
            return next(new ErrorResponse('Report not found', 404));
        }

        if (report.status !== 'pending') {
            return next(new ErrorResponse('Report already handled', 400));
        }

        // Perform action based on report type
        let item;
        if (report.itemType === 'question') {
            item = await Question.findById(report.reportedItem);
        } else if (report.itemType === 'answer') {
            item = await Answer.findById(report.reportedItem);
        } else if (report.itemType === 'user') {
            item = await User.findById(report.reportedItem);
        }

        if (!item) {
            return next(new ErrorResponse('Reported item not found', 404));
        }

        // Take action (in a real app, you'd have more sophisticated logic)
        if (actionTaken === 'delete') {
            if (report.itemType === 'user') {
                item.banned = true;
                await item.save();
            } else {
                await item.remove();
            }
        } else if (actionTaken === 'warn') {
            // In a real app, you'd send a warning to the user
        }

        // Update report status
        report.status = 'resolved';
        report.actionTaken = actionTaken;
        report.handledBy = req.user.id;
        report.handledAt = new Date();
        await report.save();

        // Notify reporter
        await createNotification({
            recipient: report.reporter,
            type: 'admin',
            text: `Your report has been resolved (action taken: ${actionTaken})`
        });

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Dismiss report
// @route   PUT /api/reports/:id/dismiss
// @access  Private/Admin
exports.dismissReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return next(new ErrorResponse('Report not found', 404));
        }

        if (report.status !== 'pending') {
            return next(new ErrorResponse('Report already handled', 400));
        }

        report.status = 'dismissed';
        report.handledBy = req.user.id;
        report.handledAt = new Date();
        await report.save();

        res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};