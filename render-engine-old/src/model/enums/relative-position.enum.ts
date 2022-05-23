export enum RelativePosition {
    LeftFrom                    = 1 << 0, // 1
    RightFrom                   = 1 << 1, // 2
    Above                       = 1 << 2, // 4
    Below                       = 1 << 3, // 8
    AboveAndLeftFrom            = 5, 
    AboveAndRightFrom           = 6,
    BelowAndLeftFrom            = 9,
    BelowAndRightFrom           = 10,
}