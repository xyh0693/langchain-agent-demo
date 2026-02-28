from app.agent import calculator


def test_addition():
    assert calculator.invoke("2 + 3") == "5.0"


def test_multiplication():
    assert calculator.invoke("4 * 7") == "28.0"


def test_power():
    assert calculator.invoke("2 ** 10") == "1024.0"


def test_division():
    assert calculator.invoke("10 / 4") == "2.5"


def test_negative():
    assert calculator.invoke("-5 + 3") == "-2.0"


def test_invalid_expression_returns_error():
    result = calculator.invoke("import os")
    assert result.startswith("Error")


def test_expression_too_long():
    long_expr = "1+" * 101 + "1"
    result = calculator.invoke(long_expr)
    assert result.startswith("Error: expression too long")
