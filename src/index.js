import React, {Component} from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image
} from 'react-native'
import Moment from 'moment'
import {extendMoment} from 'moment-range'

const moment = extendMoment(Moment)

type DatesType = {
    range: boolean,
    date: ?moment,
    startDate: ?moment,
    endDate: ?moment,
    focusedInput: 'startDate' | 'endDate',
    onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
    isDateBlocked: (date: moment) => boolean,
    onDisableClicked: (date: moment) => void,
    focusedMonth: ?moment
}

type MonthType = {
    range: boolean,
    date: ?moment,
    startDate: ?moment,
    endDate: ?moment,
    focusedInput: 'startDate' | 'endDate',
    currentDate: moment,
    focusedMonth: moment,
    onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
    isDateBlocked: (date: moment) => boolean,
    onDisableClicked: (date: moment) => void
}

type WeekType = {
    range: boolean,
    date: ?moment,
    startDate: ?moment,
    endDate: ?moment,
    focusedInput: 'startDate' | 'endDate',
    startOfWeek: moment,
    onDatesChange: (date: { date?: ?moment, startDate?: ?moment, endDate?: ?moment }) => void,
    isDateBlocked: (date: moment) => boolean,
    onDisableClicked: (date: moment) => void
}

const styles = StyleSheet.create({
    calendar: {
        backgroundColor: 'rgb(255, 255, 255)',
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 17,
        backgroundColor: '#f8d263',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    arrowIcon:{
        width: 20,
        height: 20,
        resizeMode: 'contain'
    },
    dateTitle:{
        flexDirection: 'row',
        alignItems: 'center'
    },
    monthHeader:{
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
        marginRight: 10,
    },
    yearHeader:{
        color: '#fff',
        fontSize: 18,
    },
    week: {
        flexDirection: 'row',
    },
    dayName: {
        flexGrow: 1,
        flexBasis: 1,
        textAlign: 'center',
        color: '#aaaaaa',
        paddingVertical: 10,
        fontWeight: 'bold'
    },
    day: {
        flexGrow: 1,
        flexBasis: 1,
        alignItems: 'center',
        padding: 10,

    },
    dayBlocked: {
        backgroundColor: 'rgb(255, 255, 255)',
    },
    daySelected: {
        backgroundColor: '#f8d263',
    },
    dayText: {
        color: '#595959',
        fontWeight: '600',
    },
    dayDisabledText: {
        color: 'gray',
        opacity: 0.5,
        fontWeight: '400',
    },
    daySelectedText: {
        color: 'rgb(252, 252, 252)',
    },
})

const dates = (startDate: ?moment, endDate: ?moment, focusedInput: 'startDate' | 'endDate') => {
    if (focusedInput === 'startDate') {
        if (startDate && endDate) {
            return ({startDate, endDate: null, focusedInput: 'endDate'})
        }
        return ({startDate, endDate, focusedInput: 'endDate'})
    }

    if (focusedInput === 'endDate') {
        if (endDate && startDate && endDate.isBefore(startDate)) {
            return ({startDate: endDate, endDate: null, focusedInput: 'endDate'})
        }
        return ({startDate, endDate, focusedInput: 'startDate'})
    }

    return ({startDate, endDate, focusedInput})
}

export const Week = (props: WeekType) => {
    const {
        range,
        date,
        startDate,
        endDate,
        focusedInput,
        startOfWeek,
        onDatesChange,
        isDateBlocked,
        onDisableClicked,
    } = props

    const days = []
    const endOfWeek = startOfWeek.clone().endOf('isoweek')

    const getDayRange = moment.range(startOfWeek, endOfWeek)
    Array.from(getDayRange.by('days')).map((day: moment) => {
        const onPress = () => {
            if (isDateBlocked(day)) {
                onDisableClicked(day)
            } else if (range) {
                let isPeriodBlocked = false
                const start = focusedInput === 'startDate' ? day : startDate
                const end = focusedInput === 'endDate' ? day : endDate
                if (start && end) {
                    moment.range(start, end).by('days', (dayPeriod: moment) => {
                        if (isDateBlocked(dayPeriod)) {
                            isPeriodBlocked = true
                        }
                    })
                }
                onDatesChange(isPeriodBlocked ?
                    dates(end, null, 'startDate') :
                    dates(start, end, focusedInput))
            } else {
                onDatesChange({date: day})
            }
        }

        const isDateSelected = () => {
            if (range) {
                if (startDate && endDate) {
                    return day.isSameOrAfter(startDate, 'day') && day.isSameOrBefore(endDate, 'day')
                }
                return (startDate && day.isSame(startDate, 'day')) || (endDate && day.isSame(endDate, 'day'))
            }
            return date && day.isSame(date, 'day')
        }

        const isBlocked = isDateBlocked(day)
        const isSelected = isDateSelected()

        const style = [
            styles.day,
            isBlocked && styles.dayBlocked,
            isSelected && styles.daySelected,
        ]

        const styleText = [
            styles.dayText,
            isBlocked && styles.dayDisabledText,
            isSelected && styles.daySelectedText,
        ]

        days.push(
            <TouchableOpacity
                key={day.date()}
                style={style}
                onPress={onPress}
                disabled={isBlocked && !onDisableClicked}
            >
                <Text style={styleText}>{day.date()}</Text>
            </TouchableOpacity>,
        )
        return null
    })

    return (
        <View style={styles.week}>{days}</View>
    )
}

export const Month = (props: MonthType) => {
    const {
        range,
        date,
        startDate,
        endDate,
        focusedInput,
        currentDate,
        focusedMonth,
        onDatesChange,
        isDateBlocked,
        onDisableClicked,
    } = props

    const dayNames = []
    const weeks = []
    const startOfMonth = focusedMonth.clone().startOf('month').startOf('isoweek')
    const endOfMonth = focusedMonth.clone().endOf('month')
    const weekRange = moment.range(currentDate.clone().startOf('isoweek'), currentDate.clone().endOf('isoweek'))

    Array.from(weekRange.by('days')).map((day: moment) => {
        dayNames.push(
            <Text key={day.date()} style={styles.dayName}>
                {day.format('dd')}
            </Text>,
        )
        return null
    })

    const getMonthRange = moment.range(startOfMonth, endOfMonth)
    Array.from(getMonthRange.by('weeks')).map((week: moment) => {
        weeks.push(
            <Week
                key={week}
                range={range}
                date={date}
                startDate={startDate}
                endDate={endDate}
                focusedInput={focusedInput}
                currentDate={currentDate}
                focusedMonth={focusedMonth}
                startOfWeek={week}
                onDatesChange={onDatesChange}
                isDateBlocked={isDateBlocked}
                onDisableClicked={onDisableClicked}
            />,
        )
        return null
    })


    return (
        <View style={styles.month}>
            <View style={styles.week}>
                {dayNames}
            </View>
            {weeks}
        </View>
    )
}

export default class Dates extends Component {
    state = {
        currentDate: moment(),
        focusedMonth: moment().startOf('month'),
    }

    componentDidMount() {
        this.setFocusedMonth()
    }

    setFocusedMonth = () => {
        const {focusedMonth} = this.props
        if (focusedMonth) {
            this.setState({focusedMonth: moment(focusedMonth, 'MMMM D, YYYY h:mm a').startOf('month')})
        }
    }

    props: DatesType

    render() {
        const previousMonth = () => {
            this.setState({focusedMonth: this.state.focusedMonth.add(-1, 'M')})
        }

        const nextMonth = () => {
            this.setState({focusedMonth: this.state.focusedMonth.add(1, 'M')})
        }

        return (
            <View style={styles.calendar}>
                <View style={styles.heading}>
                    <TouchableOpacity onPress={previousMonth}>
                        <Image source={require('./images/arrow-left.png')} style={styles.arrowIcon}/>
                    </TouchableOpacity>

                    <View style={styles.dateTitle}>
                        <Text style={styles.monthHeader}>{this.state.focusedMonth.format('MMMM')}</Text>
                        <Text style={styles.yearHeader}>{this.state.focusedMonth.format('YYYY')}</Text>
                    </View>

                    <TouchableOpacity onPress={nextMonth}>
                        <Image source={require('./images/arrow-right.png')} style={styles.arrowIcon}/>
                    </TouchableOpacity>
                </View>

                <Month
                    range={this.props.range}
                    date={this.props.date}
                    startDate={this.props.startDate}
                    endDate={this.props.endDate}
                    focusedInput={this.props.focusedInput}
                    currentDate={this.state.currentDate}
                    focusedMonth={this.state.focusedMonth}
                    onDatesChange={this.props.onDatesChange}
                    isDateBlocked={this.props.isDateBlocked}
                    onDisableClicked={this.props.onDisableClicked}
                />
            </View>
        );
    }
}
