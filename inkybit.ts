
namespace inkyfixed{

    

    export enum PixelSize {
        //% block="normal (1x)" defl=True
        Normal = 1,
        //% block="double (2x)"
        Double = 2,
        //% block="triple (3x)"
        Triple = 3,
        //% block="quad (4x)"
        Quad = 4
    }

    export enum TextSize {
        //% block="regular (2x)" defl=True
        Regular = 2,
        //% block="tiny (1x)"
        Tiny = 1,
        //% block="medium (3x)"
        Medium = 3,
        //% block="large (4x)"
        Large = 4
    }

    export enum Color {
        //% block="black" defl=True
        Black = 1,
        //% block="white"
        White = 0,
        //% block="accent"
        Accent = 2
    }

    const ARROWOFFSET: number = 40

    let _pixelSize: number
    let y = 0
    let width = 0
    let offset_y = 0
    let offset_x = 0
    let cs_active = 0
    let dc_command = 0
    let cols = 0
    let shift = 0
    let offset = 0
    let buf_b:Buffer
    let buf_r :Buffer
    
    let luts :number[]
    let dc:DigitalPin
    let cs:DigitalPin
    let reset:DigitalPin
    let busy:DigitalPin
    let height:number
    let rows:number
    let drivercontrol:number
    let gate_voltage:number
    let source_voltage:number
    let display_control:number
    let non_overlap:number
    let booster_soft_start:number
    let gate_scan_start:number
    let DEEP_SLEEP:number
    let DATA_MODE:number
    let SW_RESET:number
    let TEMP_WRITE:number
    let TEMP_READ:number
    let TEMP_CONTROL:number
    let TEMP_LOAD:number
    let MASTER_ACTIVATE:number
    let DISP_CTRL1:number
    let DISP_CTRL2:number
    let WRITE_RAM:number
    let WRITE_ALTRAM:number
    let READ_RAM:number
    let VCOM_SENSE:number
    let VCOM_DURATION:number
    let WRITE_VCOM:number
    let READ_OTP:number
    let WRITE_LUT:number
    let WRITE_DUMMY:number
    let WRITE_GATELINE:number
    let WRITE_BORDER:number
    let SET_RAMXPOS:number
    let SET_RAMYPOS:number
    let SET_RAMXCOUNT:number
    let SET_RAMYCOUNT:number
    let cs_inactive:number
    let dc_data:number

    export function init(){
        _pixelSize = 1
        buf_b = pins.createBuffer((136 / 8) * 250)
        buf_r = pins.createBuffer((136 / 8) * 250)
        buf_b.fill(0xff)
        buf_r.fill(0)
        luts = [
            2,
            2,
            1,
            17,
            18,
            18,
            34,
            34,
            102,
            105,
            105,
            89,
            88,
            153,
            153,
            136,
            0,
            0,
            0,
            0,
            248,
            180,
            19,
            81,
            53,
            81,
            81,
            25,
            1,
            0
        ]

        offset_y = 6
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13)
        dc = DigitalPin.P12
        cs = DigitalPin.P8
        reset = DigitalPin.P2
        busy = DigitalPin.P16
        width = 250
        height = 122
        cols = 136
        rows = 250
        drivercontrol = 1
        gate_voltage = 3
        source_voltage = 4
        display_control = 7
        non_overlap = 11
        booster_soft_start = 12
        gate_scan_start = 15
        DEEP_SLEEP = 16
        DATA_MODE = 17
        SW_RESET = 18
        TEMP_WRITE = 26
        TEMP_READ = 27
        TEMP_CONTROL = 28
        TEMP_LOAD = 29
        MASTER_ACTIVATE = 32
        DISP_CTRL1 = 33
        DISP_CTRL2 = 34
        WRITE_RAM = 36
        WRITE_ALTRAM = 38
        READ_RAM = 37
        VCOM_SENSE = 40
        VCOM_DURATION = 41
        WRITE_VCOM = 44
        READ_OTP = 45
        WRITE_LUT = 50
        WRITE_DUMMY = 58
        WRITE_GATELINE = 59
        WRITE_BORDER = 60
        SET_RAMXPOS = 68
        SET_RAMYPOS = 69
        SET_RAMXCOUNT = 78
        SET_RAMYCOUNT = 79
        cs_inactive = 1
        dc_data = 1


    }
    

    function justspiCommand(command: number) {
        pins.digitalWritePin(cs, cs_active)
        pins.digitalWritePin(dc, dc_command)
        pins.spiWrite(command & 0xff)
        pins.digitalWritePin(cs, cs_inactive)
    }

    function spiData(data: Buffer) {
        pins.digitalWritePin(cs, cs_active)
        pins.digitalWritePin(dc, dc_data)
        for (let j = 0; j < data.length; j++) {
            pins.spiWrite(data[j])
        }
        pins.digitalWritePin(cs, cs_inactive)
    }

    function spiCommand(command: number, data: number[]) {
        pins.digitalWritePin(cs, cs_active)
        pins.digitalWritePin(dc, dc_command)
        pins.spiWrite(command & 0xff)
        if (data.length > 0) {
            pins.digitalWritePin(dc, dc_data)
            for (let i = 0; i < data.length; i++) {
                pins.spiWrite(data[i])
            }
        }
        pins.digitalWritePin(cs, cs_inactive)
    }

    export function drawArrow(arrow: ArrowNames, x: number, y: number, color: Color = Color.Black, size: TextSize = TextSize.Regular): void {
        let image: Image = images.arrowImage(arrow)
        drawImage(image, x, y, color, size)
    }

    export function drawIcon(icon: IconNames, x: number, y: number, color: Color = Color.Black, size: TextSize = TextSize.Regular): void {
        let image: Image = images.iconImage(icon)
        drawImage(image, x, y, color, size)
    }

    // Font bindings

    //% shim=inkybit::getFontDataByte
    function getFontDataByte(index: number): number {
        return 0
    }

    //% shim=inkybit::getFontData
    function getFontData(index: number): Buffer {
        return pins.createBuffer(5)
    }

    //% shim=inkybit::getCharWidth
    function getCharWidth(char: number): number {
        return 5
    }

    function getChar(character: string): Buffer {
        return getFontData(character.charCodeAt(0))
    }

    function charWidth(character: string, size: TextSize = TextSize.Regular): number {
        let charcode: number = character.charCodeAt(0)
        if (charcode > DAL.MICROBIT_FONT_ASCII_END) {
            return 5 * size
        }
        return getCharWidth(charcode) * size
    }

    export function drawChar(char: string, x: number, y: number, color: Color = Color.Black, size: TextSize = TextSize.Regular): void {
        let rows: number = 5 * size
        let cols: number = 5 * size

        if (char.charCodeAt(0) > DAL.MICROBIT_FONT_ASCII_END + ARROWOFFSET) {
            drawArrow(char.charCodeAt(0) - DAL.MICROBIT_FONT_ASCII_END - ARROWOFFSET - 1, x, y, color, size)
            return
        }
        if (char.charCodeAt(0) > DAL.MICROBIT_FONT_ASCII_END) {
            drawIcon(char.charCodeAt(0) - DAL.MICROBIT_FONT_ASCII_END - 1, x, y, color, size)
            return
        }
        let data: Buffer = getChar(char)
        for (let c_row = 0; c_row < rows; c_row++) {
            let s_row: number = Math.floor(c_row / size)
            for (let c_col = 0; c_col < cols; c_col++) {
                let s_col: number = Math.floor(c_col / size)
                if ((data[s_row] & (1 << (4 - s_col))) > 0) {
                    setpixel(x + c_col, y + c_row, color)
                }
            }
        }
    }

    export function drawImage(image: Image, x: number, y: number, color: Color = Color.Black, size: TextSize = TextSize.Regular): void {
        let rows: number = 5 * size
        let cols: number = image.width() * size
        for (let c_row = 0; c_row < rows; c_row++) {
            let s_row: number = Math.floor(c_row / size)
            for (let c_col = 0; c_col < cols; c_col++) {
                let s_col: number = Math.floor(c_col / size)
                if (image.pixelBrightness(s_col, s_row)) {
                    setpixel(x + c_col, y + c_row, color)
                }
            }
        }
    }

    export function setPixelSize(size: PixelSize = PixelSize.Normal): void {
        _pixelSize = size
    }

    export function getPixelSize(): PixelSize {
        return _pixelSize
    }

    export function drawRectangle(x: number, y: number, width: number, height: number, color: Color = Color.Black, filled: Boolean = false): void {
        let c: number = color
        let px: number = 0
        let py: number = 0
        /*
          x, y          x+w, y
          x, y+h        x+w, y+h
        */
        drawLine(x, y, x + width, y, c)
        drawLine(x, y, x, y + height, c)
        drawLine(x + width, y, x + width, y + height, c)
        drawLine(x, y + height, x + width, y + height, c)

        if (filled) {
            x += 1
            y += 1
            width -= 2
            height -= 2
            for (py = y; py <= y + height; py++) {
                for (px = x; px <= x + width; px++) {
                    setpixel(px, py, c)
                }
            }
        }
    }

    export function drawLine(x0: number, y0: number, x1: number, y1: number, color: Color = Color.Black): void {
        let c: number = color
        let dx: number = Math.abs(x1 - x0)
        let sx: number = x0 < x1 ? 1 : -1
        let dy: number = -Math.abs(y1 - y0)
        let sy: number = y0 < y1 ? 1 : -1

        let err: number = dx + dy;  /* error value e_xy */
        while (true) {  /* loop */
            setpixel(x0, y0, c)
            if (x0 == x1 && y0 == y1) break;
            let e2: number = 2 * err;
            if (e2 >= dy) { /* e_xy+e_x > 0 */
                err += dy;
                x0 += sx;
            }
            if (e2 <= dx) { /* e_xy+e_y < 0 */
                err += dx;
                y0 += sy;
            }
        }
    }

    export function clear() {
        buf_b.fill(0xff)
        buf_r.fill(0)
    }

    export function setpixel(x: number, y: number, color: number) {
        if (x > width) {
            return
        }
        if (y > width) {
            return
        }

        y += offset_y
        y = cols - 1 - y
        shift = 7 - y % 8
        y = Math.floor(y / 8)
        offset = x * Math.floor(cols / 8) + y
        let byte_b = buf_b[offset] | (0b1 << shift)
        let byte_r = buf_r[offset] & ~(0b1 << shift)
        if (color == 2) {
            byte_r |= 0b1 << shift
        }
        if (color == 1) {
            byte_b &= ~(0b1 << shift)
        }
        buf_b[offset] = byte_b & 0xff
        buf_r[offset] = byte_r & 0xff
    }

    function busywait() {
        //basic.showNumber(pins.digitalReadPin(busy))
        while (pins.digitalReadPin(busy)) {
            control.waitMicros(50)
        }
    }

    export function show() {
        pins.digitalWritePin(reset, 0)
        control.waitMicros(100)
        pins.digitalWritePin(reset, 1)
        control.waitMicros(100)
        justspiCommand(0x12)
        control.waitMicros(500)
        busywait()
        spiCommand(drivercontrol, [rows - 1, (rows - 1) >> 8, 0x00])
        spiCommand(WRITE_DUMMY, [0x1B])
        spiCommand(WRITE_GATELINE, [0x0b])
        spiCommand(DATA_MODE, [0x03])
        spiCommand(SET_RAMXPOS, [0x00, (cols / 8) - 1])
        spiCommand(SET_RAMYPOS, [0x00, 0x00, (rows - 1) & 0xff, (rows - 1) >> 8])
        spiCommand(WRITE_VCOM, [0x70])
        spiCommand(WRITE_LUT, luts)
        spiCommand(SET_RAMXCOUNT, [0x00])
        spiCommand(SET_RAMYCOUNT, [0x00, 0x00])
        justspiCommand(WRITE_RAM)
        spiData(buf_b)
        justspiCommand(WRITE_ALTRAM)
        spiData(buf_r)
        busywait()
        justspiCommand(MASTER_ACTIVATE);
    }

    
}
