from urlparse import parse_qs


def parse_q_params(query_string):
    # Parse the query param string
    q_params = dict(parse_qs(query_string))
    # Get the value from the list
    q_params = {k: v[0] for k, v in q_params.items()}
    return q_params
