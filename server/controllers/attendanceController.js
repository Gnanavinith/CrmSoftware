import Attendance from '../models/Attendance.js'

function normalizeDateOnly(d) {
  const date = new Date(d)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function minutesBetween(start, end) {
  return Math.round(Math.max(0, end.getTime() - start.getTime()) / 60000)
}

export const checkIn = async (req, res) => {
  try {
    const { _id: userId, name, email } = req.user
    const { note = '', location = 'Office' } = req.body || {}
    const today = normalizeDateOnly(new Date())

    let record = await Attendance.findOne({ user: userId, date: today })
    if (record) {
      return res.status(200).json(record)
    }

    record = await Attendance.create({
      user: userId,
      name,
      email,
      date: today,
      checkIn: new Date(),
      note,
      location
    })

    return res.status(201).json(record)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check in', error: err.message })
  }
}

export const checkOut = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const today = normalizeDateOnly(new Date())
    const record = await Attendance.findOne({ user: userId, date: today })
    if (!record || !record.checkIn) {
      return res.status(400).json({ message: 'No check-in found for today' })
    }
    if (record.checkOut) {
      return res.status(200).json(record)
    }

    const now = new Date()
    record.checkOut = now
    record.durationMinutes = minutesBetween(new Date(record.checkIn), now)
    await record.save()
    return res.status(200).json(record)
  } catch (err) {
    return res.status(500).json({ message: 'Failed to check out', error: err.message })
  }
}

export const getMyAttendance = async (req, res) => {
  try {
    const { _id: userId } = req.user
    const { startDate, endDate } = req.query

    const query = { user: userId }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = normalizeDateOnly(startDate)
      if (endDate) query.date.$lte = normalizeDateOnly(endDate)
    }

    const records = await Attendance.find(query).sort({ date: -1 })

    // Stats
    const now = new Date()
    const todayKey = normalizeDateOnly(now).getTime()
    const todayRecord = records.find((r) => normalizeDateOnly(r.date).getTime() === todayKey)

    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const monthRecords = records.filter((r) => {
      const d = new Date(r.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })
    const present = monthRecords.filter((r) => r.checkIn && r.checkOut).length
    const workingDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    const attendanceRate = workingDays > 0 ? Number(((present / workingDays) * 100).toFixed(1)) : 0

    return res.status(200).json({
      data: records,
      stats: {
        todayStatus: todayRecord ? (todayRecord.checkOut ? 'Present' : 'Working') : 'Not Checked In',
        presentThisMonth: present,
        attendanceRate,
        totalRecords: records.length
      }
    })
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance', error: err.message })
  }
}



